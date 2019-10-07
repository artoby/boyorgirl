#!/bin/bash

function absolutePath()
{
    local  result="$(cd "$(dirname "$1")"; pwd)/$(basename "$1")"
    echo "$result"
}

for itSiteRelPath in ./sites/*
do
  itSiteName="$(basename -- $itSiteRelPath)"
  #itFullPath="$(cd "$(dirname "$itFilePath")"; pwd)/$(basename "$itFilePath")"
  itSitePath=$(absolutePath $itSiteRelPath)
  
  itAvailablePath="/etc/nginx/sites-available/$itSiteName"
  echo "Linking: $itAvailablePath -> $itSitePath"
  sudo ln -sf "$itSitePath" "$itAvailablePath" 

  itEnabledPath="/etc/nginx/sites-enabled/$itSiteName"
  echo "Linking: $itEnabledPath -> $itSitePath"
  sudo ln -sf "$itSitePath" "$itEnabledPath"
done
