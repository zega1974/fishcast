'use client';

import { useState } from 'react';

import AddCapturePanel from '@/components/AddCapturePanel';
import type { CaptureFormData } from '@/components/captures/types';

function createPreviewFormData(): CaptureFormData {
  return {
    species: '',
    weight: '',
    size: '',
    bait: '',
    comment: '',
    photo: '',
    capturedDate: '2026-06-11',
    capturedTime: '23:05',
  };
}

function deriveWeightParts(weight: string) {
  const normalizedWeight = String(weight || '').replace(',', '.').trim();

  if (!normalizedWeight) {
    return { kg: '', grams: '' };
  }

  const parsedWeight = Number.parseFloat(normalizedWeight);

  if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
    return { kg: '', grams: '' };
  }

  const wholeKg = Math.floor(parsedWeight);
  const grams = Math.round((parsedWeight - wholeKg) * 1000);

  if (grams <= 0) {
    return {
      kg: wholeKg > 0 ? String(wholeKg) : '',
      grams: '',
    };
  }

  if (grams >= 1000) {
    return {
      kg: String(wholeKg + 1),
      grams: '',
    };
  }

  return {
    kg: wholeKg > 0 ? String(wholeKg) : '',
    grams: String(grams),
  };
}

export default function AddCapturePanelPreview() {
  const [formData, setFormData] = useState(createPreviewFormData);
  const weightParts = deriveWeightParts(formData.weight);

  function updateWeightFromParts(nextKg: string, nextGrams: string) {
    const cleanKg = nextKg.replace(/[^\d]/g, '');
    const cleanGrams = nextGrams.replace(/[^\d]/g, '').slice(0, 3);

    const hasKg = cleanKg.length > 0;
    const hasGrams = cleanGrams.length > 0;

    if (!hasKg && !hasGrams) {
      setFormData({ ...formData, weight: '' });
      return;
    }

    const kgValue = hasKg ? Number.parseInt(cleanKg, 10) : 0;
    const gramsValue = hasGrams ? Math.min(Number.parseInt(cleanGrams, 10), 999) : 0;

    const totalWeight = kgValue + gramsValue / 1000;
    const nextWeight = gramsValue > 0 ? String(Number(totalWeight.toFixed(3))) : String(kgValue);

    setFormData({ ...formData, weight: nextWeight });
  }

  return (
    <AddCapturePanel
      lat={-25.652514}
      lng={-48.171916}
      formData={formData}
      weightParts={weightParts}
      onFormDataChange={setFormData}
      onWeightPartsChange={updateWeightFromParts}
      onSave={() => undefined}
      onCancel={() => undefined}
    />
  );
}
