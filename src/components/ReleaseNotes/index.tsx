import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import Release from './Release';

const ReleaseNotes = ({
  releases,
  images,
  product,
  handleViewMore,
  changelog: changelogURL,
}) => {
  const title = useMemo(() => {
    switch (product) {
      case 'edge-stack':
        return 'Edge Stack Release Notes';
      case 'telepresence':
        return 'Telepresence Release Notes';
      case 'argo':
        return 'Argo Release Notes';
      case 'cloud':
        return 'Cloud Release Notes';
      default:
        return 'Release Notes';
    }
  }, [product]);

  const changelog = useMemo(() => {
    const commonText = `For a detailed list of all the changes in these releases, please consult the`;
    
    if (changelogURL) {
      return (
        <>
          {commonText} <Link to={changelogURL}>CHANGELOG.</Link>
        </>
      );
    }

    return null;
  }, [product]);

  return (
    <>
      <h1>{title}</h1>
      <p>{changelog}</p>
      <div>
        {releases.map((release) => (
          <Release
            key={release.version}
            release={release}
            images={images}
            handleViewMore={handleViewMore}
          />
        ))}
      </div>
    </>
  );
};

export default ReleaseNotes;
