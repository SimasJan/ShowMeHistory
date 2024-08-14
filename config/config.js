// define configuration parameters here 
export const Configuration = {
    ApiKeys: {
        googleVisionApiKey: 'AIzaSyDwWNEKtaQbiEWTBoxIl8i8gFFbgrSiS4w',
        geminiApiKey: 'AIzaSyAIp3hZASpM_ATkkG3NAq98ScCKHkDWnR0',
        searchEngineID: '41b7ef4e5f78444a6',
    },
    Urls: {
        searchHistoricPhotos: 'https://www.googleapis.com/customsearch/v1',
        generateContent: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        googleVision: 'https://vision.googleapis.com/v1/images:annotate',
    },
    DetectionFeatures: [
        { type: 'LANDMARK_DETECTION', maxResults: 5 },
        { type: 'WEB_DETECTION', maxResults: 5 },
    ],
    SearchHistoricPhotosParams: {
        query: 'historic photo',
        searchType: 'image',
        maxResults: 10,
        imgType: 'photo',
        // rights: 'cc_publicdomain|cc_attribute|cc_sharealike', // TODO: find out more about this!
    }
}