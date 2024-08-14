
export const handleErrorMessage = (error) => {    
    if (!error) {
        return null;
    } else if (typeof error === 'string') {
        if (error.length > 1000) {
            return error.substring(0, 1000) + '...';
        } else {
            return error
        }
    }
}

export const cleanTitle = (title) => {
    // Remove common prefixes
    title = title.replace(/^(File:|Image:)/, '').trim();
    
    // Remove file extensions
    title = title.replace(/\.(jpg|jpeg|png|gif)$/i, '').trim();
    
    // Remove common suffixes
    title = title.replace(/- Wikimedia Commons$/, '').trim();
    
    // Remove text after | or - if it contains common words
    title = title.replace(/[\||-].*?(flickr|commons|wikimedia).*$/i, '').trim();
    
    // Capitalize first letter of each word
    title = title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    
    return title;
  };