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

  return (
    <spContext.Provider value={{sp, context}}>
      <AppRouter />
    </spContext.Provider>
  );
}

