# Historical Landmark and Building Recognition App

## Overview

Let's say you are a tourist visiting a city and you want to know more about the landmarks and buildings in the city. You can use this app to get information about the following:
- landmarks and buildings in the city
- historical information about the landmarks and buildings
- historical images of the landmarks and buildings
- nearby landmarks or related points of interest (e.g. historical sites, museums, events, etc.)


### App description

<div align="center">
    <img src="./assets/logo1.png" width="300" height="200">
</div>

**Show Me History** an innovative mobile application designed to enhance the tourist experience by providing instant, detailed information about landmarks and buildings. Using advanced image recognition technology and Large Language Models (LLMs) technology, the app allows users to simply take a photo of a landmark or building to receive comprehensive details about its history, including historic photos, significance, and interesting facts.

Key Features:
1. Landmark Detection: Utilizing Google's Vision API, the app accurately identifies landmarks and buildings from user-submitted photos.
2. Historical Context: The app provides rich historical information about identified landmarks, offering users a deeper understanding of the site's cultural and historical significance.
3. Historic Image Gallery: Users can explore a curated collection of historical photos related to the landmark, offering a visual journey through time.
4. Web Entity Detection: The app leverages web detection to provide additional context and related information about the landmark.
5. User Feedback System: Users can upvote or downvote results, helping to improve the accuracy and relevance of the information provided.


Integration of Gemini API:
The Gemini API plays a crucial role in enhancing our app's capabilities:

- Multimodal Understanding: Gemini's ability to process both images and text allows us to cross-reference visual data with textual information, providing more accurate and comprehensive results.
- Dynamic Content Generation: The API helps in creating engaging, context-aware historical narratives for each landmark, tailoring the information to the user's specific location and the landmark's unique features.
- Contextual Recommendations: By analyzing user preferences and historical data, Gemini helps in suggesting nearby landmarks or related points of interest (e.g. historical sites, museums, events, etc.).

By integrating the Gemini API, our app transforms from a simple recognition tool into an intelligent, interactive guide that brings history to life, making every tourist experience more enriching and educational.


### Using the app
1. Open the app
2. Take a photo of a landmark or building. Preview the photo and Retake the photo if it is not clear or click Analyze to proceed.
3. The app will analyze the photo and try to find the landmark or building.
4. If the app is able to find the landmark or building, it will provide information about the landmark or building. Including historic photos, historical information, and other information.
5. You can upvote or downvote the results.


### Resources

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
    - **[Gemini API](https://ai.google.dev/pricing)** *Free of charge* The Gemini API offers generous free usage with rate limits of 15 requests per minute, 1 million tokens per minute, and 1,500 requests per day, while providing free input, output, context caching, and tuning services.
