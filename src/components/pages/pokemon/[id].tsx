// pages/pokemon/[id].tsx
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card } from '@/lib/card/card';

interface Pokemon {
  id: number;
  name: string;
  primaryType: string | null;
  secondaryType: string | null;
  image: string;
}

interface PokemonDetailProps {
  pokemon: Pokemon;
}

const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon }) => {
  const router = useRouter();

  // Example breadcrumb structure: Home -> Pokémon Name
  const breadcrumb = [
    { label: 'Home', link: '/' },
    { label: pokemon.name, link: router.asPath }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="max-w-xl">
        <nav className="mb-4">
          <ol className="flex space-x-2">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                <a href={item.link} className="text-blue-500 hover:underline">
                  {item.label}
                </a>
                {index < breadcrumb.length - 1 && <span className="mx-2">&rsaquo;</span>}
              </li>
            ))}
          </ol>
        </nav>
        <Card className="w-full">
          <div className="p-4">
            <img src={pokemon.image} alt={pokemon.name} className="mb-4" />
            <p><strong>Name:</strong> {pokemon.name}</p>
            <p><strong>Primary Type:</strong> {pokemon.primaryType}</p>
            <p><strong>Secondary Type:</strong> {pokemon.secondaryType || 'None'}</p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const details = await res.json();
  
  const pokemon: Pokemon = {
    id: details.id,
    name: details.name,
    primaryType: details.types[0]?.type.name || null,
    secondaryType: details.types[1]?.type.name || null,
    image: details.sprites.front_default,
  };

  return {
    props: {
      pokemon,
    },
  };
};

export default PokemonDetail;
