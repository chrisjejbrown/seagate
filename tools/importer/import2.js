/* eslint-disable no-undef */
export default {
    transform: ({
      // eslint-disable-next-line no-unused-vars
      document,
      url,
      params,
    }) => {
      const CTA_FRAGMENT_URL = 'https://main--sling--aemsites.aem.page/fragments/try-sling';
      const HOSTNAME = new URL(params.originalURL).origin;
      // Remove unnecessary parts of the content
      const main = document.querySelector('main');
      const results = [];
      // Get metadata from document
      const meta = WebImporter.Blocks.getMetadata(document);
      const authorName = document.querySelector('.author-card--author-name')?.textContent;
      const publishDate = document.querySelector('.author-card--date')?.textContent || '';
      const authorImage = document.querySelector('.author-card--author-image')?.src;
      meta.Author = authorName || '';
      if (publishDate === '') {
        meta['Publication Date'] = '';
      } else {
        // eslint-disable-next-line prefer-destructuring
        meta['Publication Date'] = new Date(publishDate).toISOString().split('T')[0];
      }
  

      // Handle category pages
      const isCategoryPage = document.querySelector('.homepage-wrapper .blog-homepage--outer');
      if (isCategoryPage) {
        const cells = [
          ['Category'],
          [''],
        ];
        const categoryBlock = WebImporter.DOMUtils.createTable(cells, document);
        // replace blog-homepage--outer with the category block
        isCategoryPage.parentElement.replaceChild(categoryBlock, isCategoryPage);
        // add metadata field
        meta.Template = 'blog-category';
      }
  
      // Remove subscribe form at the bottom of the articles
      const subscribeForm = document.querySelector('.email-capture-new')?.parentElement;
      if (subscribeForm) {
        subscribeForm.remove();
      }
  
      // attempt to remove non-content elements
      WebImporter.DOMUtils.remove(main, [
        'header',
        '.header',
        'nav',
        '.nav',
        'footer',
        '.footer',
        'noscript',
        'iframe',
        '.breadcrumb',
        '.author-card',
        '.popular-content',
        '.js-react-spacer',
        '.email-capture--container',
        '.blog-homepage--outer',
      ]);
  
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      WebImporter.rules.convertIcons(main, document);
  
      // Override edge case with og:image
      const img = document.querySelector('meta[property="og:image"]')?.content;
      if (img && img.startsWith('https://www.sling.com') && img.includes('dish.scene7.com')) {
        const newImg = img.replace('https://www.sling.com', '');
        const el = document.createElement('img');
        el.src = newImg;
        meta.Image = el;
  
        const imgAlt = document.querySelector('meta[property="og:image:alt"]')?.content;
        if (imgAlt) {
          el.alt = imgAlt;
        } else {
          el.alt = meta.Title;
        }
      }
  
      // Add metadata block to the document
      const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  

      // // append the block to the main element
      main.append(block);
  
      const newPathUrl = new URL(params.originalURL).pathname;
      const newPath = decodeURIComponent(newPathUrl)
        .toLowerCase()
        .replace(/\/$/, '')
        .replace(/\.html$/, '')
        .replace(/[^a-z0-9/]/gm, '-');
      // const newPath = decodeURIComponent(new URL(url).pathname)
      //                .replace('.htm', '').replace('/news/', `/news/${publishedYear}/`);
      // const destinationUrl = WebImporter.FileUtils.sanitizePath(newPath);
      results.push({
        element: main,
        path: newPath,
        report: {
          'Destination Path': newPath,
          'Author Image': authorImage,
        },
      });
      return results;
    },
  };