import { useState } from "react";
import Head from "next/head";
import useSWR from "swr";
import {
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  HStack,
  Tag,
  Text,
  Image,
  Divider,
  Badge,
  StackDivider,
  Link,
  CircularProgress,
} from "@chakra-ui/react";
import { SearchIcon, ExternalLinkIcon } from "@chakra-ui/icons";

import countries from "../data/countries.js";

function Results({ country, albumID }) {
  const { data, error } = useSWR(
    `https://itunes.apple.com/lookup?country=${country.code}&lang=en&id=${albumID}&entity=song&limit=200`
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <CircularProgress isIndeterminate color="teal.500" />;
  if (data.errorMessage) return <div>{data.errorMessage}</div>;

  const albums = data.results.filter(
    (result) => result.collectionType === "Album"
  );

  return (
    <VStack spacing={4}>
      <HStack>
        <Text>{country.emoji}</Text>
        <Text>{country.name}</Text>
      </HStack>
      <Divider />
      {data.resultCount === 0 ? (
        <div>Not Found</div>
      ) : (
        <>
          <Text>
            {data.resultCount} results ({albums.length} albums)
          </Text>
          <VStack spacing={4} divider={<StackDivider borderColor="gray.200" />}>
            {albums.map((album) => {
              const songs = data.results.filter(
                (result) =>
                  result.collectionId === album.collectionId &&
                  result.kind === "song"
              );
              let isStreamable = false;
              if (songs.length === 0) {
                isStreamable = true;
              } else {
                isStreamable = songs.find((song) => song.isStreamable === true);
              }
              const releaseDate = new Date(album.releaseDate);
              return (
                <VStack key={album.collectionId}>
                  <Image
                    boxSize="100px"
                    objectFit="cover"
                    src={album.artworkUrl100}
                    alt={album.collectionName}
                  />
                  <Link
                    href={album.collectionViewUrl}
                    color="teal.500"
                    isExternal
                  >
                    <Text>
                      {album.collectionName} by {album.artistName} (
                      {releaseDate.getFullYear()})
                    </Text>
                  </Link>
                  <Text>{album.primaryGenreName}</Text>
                  <Text>Released on {releaseDate.toDateString()}</Text>
                  <Text>{album.trackCount} tracks</Text>
                  <Badge colorScheme={isStreamable ? "green" : "red"}>
                    Stream on Apple Music
                  </Badge>
                  <Badge colorScheme={album.collectionPrice ? "green" : "red"}>
                    Buy on iTunes Store
                  </Badge>
                  {album.collectionPrice && (
                    <Text>
                      {album.collectionPrice} {album.currency}
                    </Text>
                  )}
                </VStack>
              );
            })}
          </VStack>
        </>
      )}
    </VStack>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchQuery(event.target.value);
    }
  };
  const selectedCountries = Object.entries(countries)
    .map(([_, value]) => value)
    .filter(
      (country) =>
        country.code === "US" || country.code === "JP" || country.code === "FR"
    );

  return (
    <div>
      <Head>
        <title>iTunes Store Search</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box w="100%" p={4}>
        <VStack>
          <HStack>
            {selectedCountries.map((country) => (
              <Tag key={country.code}>
                {country.emoji} {country.name}
              </Tag>
            ))}
          </HStack>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              type="text"
              placeholder="Search..."
              onKeyDown={handleKeyDown}
            />
          </InputGroup>
          {searchQuery && (
            <HStack
              spacing={32}
              divider={<StackDivider borderColor="gray.200" />}
            >
              {selectedCountries.map((country) => (
                <Results
                  key={country.code}
                  country={country}
                  albumID={searchQuery}
                />
              ))}
            </HStack>
          )}
        </VStack>
      </Box>
    </div>
  );
}
