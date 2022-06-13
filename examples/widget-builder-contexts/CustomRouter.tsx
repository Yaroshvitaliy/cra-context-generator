
import React from 'react';
import { Router } from 'react-router-dom';
import { History } from 'history'

export interface ICustomRouterProps {
    children: React.ReactNode;
    history: History;
}
        
export const CustomRouter = ({ history, ...props }: ICustomRouterProps) => {
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });
    
    React.useLayoutEffect(() => history.listen(setState), [history]);
    
    return (
        <Router {...props} location={state.location} navigationType={state.action} navigator={history} />
    );
};

export default CustomRouter;