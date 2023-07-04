FROM node:18 AS node_builder

WORKDIR /app
COPY ./ClientApp .
RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:6.0 as builder

WORKDIR /app
COPY . .

WORKDIR /app

COPY --from=node_builder /app/build ./ClientApp/build
RUN dotnet publish "GifGenerator.csproj" -p:BuildClientApp=false -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:6.0 as runner

RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY --from=builder /app/publish .

ENTRYPOINT ["dotnet", "GifGenerator.dll"]
