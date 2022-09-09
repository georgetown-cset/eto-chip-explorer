import React from 'react';

// There is a known issue with jest and react-xarrows.
// This workaround is from https://github.com/Eliav2/react-xarrows/pull/144.
export const Xwrapper = ({children}) => <div>{children}</div>;
export const useXarrow = () => jest.fn();

const Xarrow = () => <span />;
export default Xarrow;
