import React from 'react';
import { Hero } from '../components/Hero';
import { SelectedWorks } from '../components/SelectedWorks';
import { Journal } from '../components/Journal';
import { Explorations } from '../components/Explorations';
import { Stats } from '../components/Stats';

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWorks />
      <Journal />
      <Explorations />
      <Stats />
    </>
  );
}
