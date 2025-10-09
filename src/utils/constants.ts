// dev css
export const dev_css_url = "/SiteAssets/css/developer.css";

// Extract tenant URL and site name dynamically
export const defaultTenantUrl = window.location.origin;
 
const pathParts = window.location.pathname.split("/").filter(Boolean);
 
// This assumes a typical SharePoint URL like:
// https://aufaitcloud.sharepoint.com/sites/PMO_Aufait/SitePages/...
export const Site_Name = pathParts[0] === "sites" ? pathParts[1] : "";
 
console.log(Site_Name,"Site_Name");

export const getFolderPath = (libraryName: string, folderName: string) =>
  Site_Name
    ? `/sites/${Site_Name}/${libraryName}/${folderName}`
    : `/${libraryName}/${folderName}`;