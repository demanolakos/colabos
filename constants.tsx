
import React from 'react';
import { Camera, Users, Palette, Calendar } from 'lucide-react';

export const COLORS = {
  PRIMARY: '#FACC15', // Yellow 400
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GREY: '#F5F5F5',
  DARK_GREY: '#404040',
};

export const ROLES_ICONS = {
  PHOTOGRAPHER: <Camera size={16} />,
  MODEL: <Users size={16} />,
  MUA: <Palette size={16} />,
  DATE: <Calendar size={16} />,
};
