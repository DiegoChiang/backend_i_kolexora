const buildPaginationLinks = (req, paginationResult) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

  const buildLink = (targetPage) => {
    if (!targetPage) return null;

    const params = new URLSearchParams(req.query);
    params.set('page', targetPage);

    return `${baseUrl}?${params.toString()}`;
  };

  return {
    prevLink: paginationResult.hasPrevPage
      ? buildLink(paginationResult.prevPage)
      : null,

    nextLink: paginationResult.hasNextPage
      ? buildLink(paginationResult.nextPage)
      : null
  };
};

module.exports = buildPaginationLinks;