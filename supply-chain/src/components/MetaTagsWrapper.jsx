import React from 'react';

import MetaTags from '@eto/social-cards/dist/components/MetaTags';
import socialCard from '@eto/social-cards/dist/tools/supply-chain-explorer.png';

const MetaTagsWrapper = ({
  title = "Supply Chain Explorer: Advanced Chips",
  subtitle = undefined,
  description = "ETO's guide to the vast, complex, and critical supply chain for advanced computer chips."
}) => {
  const fullTitle = subtitle ? `${subtitle} \u2013 ${title}` : title;

  return (
    <>
      <title>{fullTitle}</title>
      <MetaTags
        title={fullTitle}
        description={description}
        socialCardUrl={socialCard}
      />
    </>
  );
};

export default MetaTagsWrapper;
