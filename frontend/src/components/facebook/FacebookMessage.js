import React from 'react'
import { FacebookProvider, CustomChat } from 'react-facebook';

export const FacebookMessage = () => {
  return (
    <FacebookProvider appId="560273716735068" chatSupport>
        <CustomChat pageId="1726154037430109" minimized={true}/>
      </FacebookProvider>    
  )
}
