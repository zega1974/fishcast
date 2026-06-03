export type SpotConditions = {
  clima: string;
  pressao: number;
  tempAgua: number;
  temperatura: number;
  lua: string;
  mare: string;
};

export type FishingSpot = {
  id: number;
  name: string;
  city: string;
  type: "litoral" | "rio" | "baía" | "represa";
  lat: number;
  lng: number;
  conditions: SpotConditions;
};

export const fishingSpots: FishingSpot[] = [
  {
    id: 1,
    name: "Matinhos",
    city: "Matinhos",
    type: "litoral",
    lat: -25.8176,
    lng: -48.5365,
    conditions: {
      clima: "Ensolarado",
      pressao: 1018,
      tempAgua: 24,
      temperatura: 27,
      lua: "Crescente",
      mare: "Alta",
    },
  },
  {
    id: 2,
    name: "Pontal do Paraná",
    city: "Pontal do Paraná",
    type: "litoral",
    lat: -25.6735,
    lng: -48.5111,
    conditions: {
      clima: "Nublado",
      pressao: 1015,
      tempAgua: 23,
      temperatura: 25,
      lua: "Cheia",
      mare: "Baixa",
    },
  },
  {
    id: 3,
    name: "Guaratuba",
    city: "Guaratuba",
    type: "baía",
    lat: -25.8827,
    lng: -48.5752,
    conditions: {
      clima: "Parcialmente nublado",
      pressao: 1017,
      tempAgua: 24,
      temperatura: 26,
      lua: "Minguante",
      mare: "Média",
    },
  },
  {
    id: 4,
    name: "Ilha do Mel",
    city: "Paranaguá",
    type: "litoral",
    lat: -25.5694,
    lng: -48.3126,
    conditions: {
      clima: "Ventando",
      pressao: 1016,
      tempAgua: 24,
      temperatura: 24,
      lua: "Nova",
      mare: "Alta",
    },
  },
  {
    id: 5,
    name: "Paranaguá",
    city: "Paranaguá",
    type: "baía",
    lat: -25.5164,
    lng: -48.5221,
    conditions: {
      clima: "Chuvoso",
      pressao: 1014,
      tempAgua: 22,
      temperatura: 23,
      lua: "Crescente",
      mare: "Baixa",
    },
  },
  {
    id: 6,
    name: "Rio Iguaçu",
    city: "União da Vitória",
    type: "rio",
    lat: -26.2303,
    lng: -51.0865,
    conditions: {
      clima: "Encoberto",
      pressao: 1019,
      tempAgua: 20,
      temperatura: 22,
      lua: "Cheia",
      mare: "N/A",
    },
  },
  {
    id: 7,
    name: "Rio Paraná",
    city: "Guaíra",
    type: "rio",
    lat: -24.085,
    lng: -54.2573,
    conditions: {
      clima: "Brisa leve",
      pressao: 1020,
      tempAgua: 19,
      temperatura: 23,
      lua: "Minguante",
      mare: "N/A",
    },
  },
  {
    id: 8,
    name: "Represa Capivari-Cachoeira",
    city: "Campina Grande do Sul",
    type: "represa",
    lat: -25.1383,
    lng: -48.8749,
    conditions: {
      clima: "Calmo",
      pressao: 1018,
      tempAgua: 21,
      temperatura: 24,
      lua: "Nova",
      mare: "N/A",
    },
  },
];
