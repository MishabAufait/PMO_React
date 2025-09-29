import * as React from "react";
import { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import { MSGraphClientV3 } from "@microsoft/sp-http";

const { Option } = Select;

interface GraphPeoplePickerProps {
  msGraphClientFactory: any;
  onUserSelected: (user: GraphUser | null) => void;
  defaultUser?: GraphUser;
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

export const GraphPeoplePicker: React.FC<GraphPeoplePickerProps> = ({
  msGraphClientFactory,
  onUserSelected,
  defaultUser
}) => {
  const [users, setUsers] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  // Initialize with default user if provided (for edit mode)
  useEffect(() => {
    if (defaultUser) {
      console.log('GraphPeoplePicker - Setting default user:', defaultUser);
      console.log('GraphPeoplePicker - Default user id type:', typeof defaultUser.id);
      setUsers([defaultUser]); // Add default user to the users array
      setSelectedValue(defaultUser.id); // Set the selected value
    } else {
      console.log('GraphPeoplePicker - No default user provided');
    }
  }, [defaultUser]);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      // Keep default user in list if it exists
      if (defaultUser) {
        setUsers([defaultUser]);
      } else {
        setUsers([]);
      }
      return;
    }
    
    setLoading(true);

    try {
      const client: MSGraphClientV3 = await msGraphClientFactory.getClient("3");
      const res = await client
        .api("/users")
        .filter(`startswith(displayName,'${query}') or startswith(mail,'${query}')`)
        .select("id,displayName,mail,userPrincipalName")
        .top(10)
        .get();

      console.log('GraphPeoplePicker - Search results:', res.value);
      
      // If there's a default user and it's not in the results, add it
      const searchResults = res.value || [];
      if (defaultUser && !searchResults.find((u: GraphUser) => u.id === defaultUser.id)) {
        setUsers([defaultUser, ...searchResults]);
      } else {
        setUsers(searchResults);
      }
    } catch (error) {
      console.error('GraphPeoplePicker - Search error:', error);
      // On error, keep default user if available
      if (defaultUser) {
        setUsers([defaultUser]);
      } else {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string | undefined) => {
    console.log('GraphPeoplePicker - Value changed:', value);
    setSelectedValue(value);
    
    if (value) {
      const selected = users.find((u) => u.id === value) || null;
      console.log('GraphPeoplePicker - Selected user:', selected);
      onUserSelected(selected);
    } else {
      onUserSelected(null);
    }
  };

  return (
    <Select
      showSearch
      value={selectedValue}
      placeholder="Type to search for a user..."
      style={{ width: "100%" }}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={loading ? <Spin size="small" /> : null}
      allowClear
      loading={loading}
    >
      {users.map((u) => (
        <Option key={u.id} value={u.id}>
          {u.displayName} ({u.mail || u.userPrincipalName})
        </Option>
      ))}
    </Select>
  );
};
