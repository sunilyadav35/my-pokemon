"use client"
// src/components/pages/index.tsx

import { useState, useEffect } from 'react';
import { Button } from "@/lib/button/button";
import { Input } from "@/lib/search/search";
import { Card } from '@/lib/card/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/lib/select/select";

interface Pokemon {
  id: number;
  name: string;
  primaryType: string | null;
  secondaryType: string | null;
  image: string;
}

const Home: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemonList, setFilteredPokemonList] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPokemonData = async () => {
      let url = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=2000";
      let allPokemonDetails: Pokemon[] = [];
      
      while (url) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          const pokemonDetails: Pokemon[] = await Promise.all(
            data.results.map(async (pokemon: { url: string }) => {
              const detailsResponse = await fetch(pokemon.url);
              const detailsData = await detailsResponse.json();
              return {
                id: detailsData.id,
                name: detailsData.name,
                primaryType: detailsData.types[0]?.type.name || null,
                secondaryType: detailsData.types[1]?.type.name || null,
                image: detailsData.sprites.front_default,
              };
            })
          );

          allPokemonDetails = [...allPokemonDetails, ...pokemonDetails];
          url = data.next; // Move to the next page
        } catch (error) {
          console.error("Error fetching Pokémon data:", error);
          url = null;
        }
      }

      const uniquePokemonDetails = Array.from(new Set(allPokemonDetails.map(pokemon => pokemon.name)))
        .map(name => allPokemonDetails.find(pokemon => pokemon.name === name)!);

      setPokemonList(uniquePokemonDetails);
      setFilteredPokemonList(uniquePokemonDetails);
    };

    fetchAllPokemonData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const filteredList = pokemonList.filter(pokemon => pokemon.primaryType === type);
    setFilteredPokemonList(filteredList);
  };

  const filteredBySearch = filteredPokemonList.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const uniqueTypes = Array.from(new Set(pokemonList.map(pokemon => pokemon.primaryType)));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="grid gap-4 w-full max-w-xl">
        <div>
          <Select onValueChange={(value) => handleTypeSelect(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Pokémon type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Pokémon Type</SelectLabel>
                {uniqueTypes.map((type, index) => (
                  <SelectItem key={index} value={type || 'None'}>
                    {type || 'None'}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full">
          <Input 
            className="flex-grow mr-4" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={handleSearch}
          />
          <Button variant="default" size="default">Search</Button>
        </div>
      </div>
      <div className="mt-6 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {filteredBySearch.map(pokemon => (
          <Card key={pokemon.id} className="w-full">
            <div className="p-4">
              <img src={pokemon.image} alt={pokemon.name} className="mb-4" />
              <p><strong>Name:</strong> {pokemon.name}</p>
              <p><strong>Primary Type:</strong> {pokemon.primaryType}</p>
              <p><strong>Secondary Type:</strong> {pokemon.secondaryType || 'None'}</p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Home;
