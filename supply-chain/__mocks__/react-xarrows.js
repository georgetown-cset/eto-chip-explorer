import React from 'react';

// There is a known issue with jest and react-xarrows.
// This workaround is from https://github.com/Eliav2/react-xarrows/pull/144.
module.exports = {
  Xarrow: () => <span />,
  Xwrapper: ({children}) => <div>{children}</div>,
  useXarrow: () => jest.fn(),
}
