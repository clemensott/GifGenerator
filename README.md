
### MSD18 - Web Service Development

# Our project

We created a prototype website where you can do following points:

- You can create an account
- You can log in
- Browse gif categories
- You can create/delete gif categories

There are several API endpoints like /api/gif/create which are functional but not implemented in the website yet.

# Authors
Group 3

Name: Clemens Ott

Name: George Oswald

Name-Prototype: GifGenerator

Repository: https://github.com/ozwoldFH/webserviceGifGenerator

# How to start the project

**Requirements to start project**

- .NET code 2.1
- npm
- Firebase Realtime Token
- Firebase Realtime Url

**How to start**

Please go to the project folder  ```webserviceGifGenerator\GifGenerator\ClientApp``` and start following command:
```
npm install
```


After that you can launch the project with Visual Studio or Rider or alternatively without an IDE.

*Start without IDE*: Go to ```\webserviceGifGenerator\GifGenerator``` and issue following command:
```
dotnet run
```

After you started the project you can access the website with this URL:
```
http://localhost:52081
```


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