# Historical Landmark and Building Recognition App

## Overview

Let's say you are a tourist visiting a city and you want to know more about the landmarks and buildings in the city. You can use this app to get information about the following:
- landmarks and buildings in the city
- historical images of the landmarks and buildings
- historical information about the landmarks and buildings
- upvote / downvote the results*
- discuss the results with other users*

Features:
- [x] Landmark Detection
- [x] Web search
- [x] Historical Images
- [ ] Historical Information
- [x] Upvote / Downvote
- [ ] Discuss with other users*


### Testing instructions

1. Open the app
2. Take a photo of a landmark or building. Preview the photo and Retake the photo if it is not clear or click Analyze to proceed.
3. The app will analyze the photo and try to find the landmark or building.
4. If the app is able to find the landmark or building, it will provide information about the landmark or building. Including historic photos, historical information, and other information.
5. You can upvote or downvote the results.



### Resources:

- Internet Detection: https://cloud.google.com/vision/docs/internet-detection
    This tutorial walks you through a basic Vision API application that uses a Web detection request. A Web detection response annotates the image sent in the request with:
    - labels obtained from the Web
    - site URLs that have matching images
    - URLs to Web images that partially or fully match the image in the request
    - URLs to visually similar images


### App Resource Management

- Pricing
    - **[Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)** provides *100 search queries per day for free*. If you need more, you may sign up for billing in the API Console. Additional requests cost $5 per 1000 queries, up to 10k queries per day.
    - **[Google Vision API]()** provides *1000 queries per day for free*. If you need more, you may sign up for billing in the API Console. Additional requests cost $5 per 1000 queries, up to 10k queries per day.