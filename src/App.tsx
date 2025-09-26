import * as React from 'react';
import 'antd/dist/reset.css';
import './App.module.scss'
import AppRouter from './AppRouter'

export const spContext = React.createContext<any>(null);

export interface IAppProps {
  sp: any
  context: any
}

export const App: React.FC<IAppProps> = ({
  sp,
  context
}) => {

    // Debug: Log to see what's actually being passed
  console.log('App - sp:', sp);
  console.log('App - context:', context);

  return (
    <spContext.Provider value={{sp, context}}>
      <AppRouter />
    </spContext.Provider>
  );
}

