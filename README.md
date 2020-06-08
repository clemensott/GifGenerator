
### MSD18 - Web Service Development

# Our project

We created a prototype website where you can do following points:

- You can create an account
- You can log in
- Browse gif categories
- You can create/delete gif categories
- Create gifs

There are some API endpoints like ```/api/category/{categoryId}/move/{destCategoryId}``` which are functional but not implemented in the website yet.

# Authors
Group 3

Name: Clemens Ott

Name: George Oswald

Name-Prototype: GifGenerator

Repository: https://github.com/ozwoldFH/webserviceGifGenerator

# How to start the project

### Requirements to start project

- .NET code 2.1 or newer
- npm
- ffmpeg
- Firebase Auth Email
- Firebase Auth Password
- Firebase Bucket Url
- Firebase Database Url
- Firebase Database Token

If you got this repository first hand (not from Github) then you probably don't have to worry about the Firebase credentials.

## How to start

#### Run npm install 
Please go to the project folder  ```webserviceGifGenerator\GifGenerator\ClientApp``` and start following command:
```
npm install
```

#### Create launch settings 
Make sure you have the settings file ```webserviceGifGenerator\GifGenerator\Properties\launchSettings.json```.
If not use ```launchSettings.json.template```
as template and enter the Firebase credentials.

#### Get ffmpeg
Download and copy ffmpeg to  ```webserviceGifGenerator\GifGenerator\ffmpeg.exe```.
It is only needed to create GIFs from videos.

#### Run the API

##### With IDE
Open ```webserviceGifGenerator\GifGenerator.sln``` Visual Studio or JetBrains Rider.

##### Without IDE
Go to ```\webserviceGifGenerator\GifGenerator``` and use following command:
```
dotnet run
```

#### Open Website
After you started the project you can access the website with this URL:
```
http://localhost:52081
```

## API call example
You can call one of the API endpoint with following post request:

```
http://localhost:52081/api/gif/create
```
with the following body (please make sure that the content type of the request is ```application/json```)
```
{
    "Sources": [
        {
            "Type": 0,
            "Url": "https://thumbs.gfycat.com/LiveCostlyElephantbeetle-size_restricted.gif",
            "FrameDelay": 8
        }
    ],
    "Size": {
        "Width": 498,
        "Height": 361
    }
}

```


**Information about xUnit tests**

Currently there are not a lot of tests. One test will fail and the other one will success. Currently we have a small problem with testing the firebase components. We might create a moq/stub for it in the future.