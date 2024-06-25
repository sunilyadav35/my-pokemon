// hooks/usePokemon.ts
import { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  primaryType: string | null;
  secondaryType: string | null;
  image: string;
}

const usePokemon = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemonList, setFilteredPokemonList] = useState<Pokemon[]>([]);

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

  return { pokemonList, filteredPokemonList, setFilteredPokemonList };
};

export default usePokemon;
