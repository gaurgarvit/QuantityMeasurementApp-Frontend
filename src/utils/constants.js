export const MEASUREMENT_TYPES = {
  LENGTH: {
    label: 'Length',
    units: ['INCH', 'FEET', 'YARD', 'MILE', 'CENTIMETER', 'METER', 'KILOMETER'],
  },
  VOLUME: {
    label: 'Volume',
    units: ['LITRE', 'GALLON', 'MILLILITRE'],
  },
  WEIGHT: {
    label: 'Weight',
    units: ['GRAM', 'KILOGRAM', 'TONNE'],
  },
  TEMPERATURE: {
    label: 'Temperature',
    units: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
  },
};

export const OPERATIONS = [
  { id: 'compare', label: 'Compare', icon: 'ArrowLeftRight' },
  { id: 'convert', label: 'Convert', icon: 'Repeat' },
  { id: 'add', label: 'Add', icon: 'Plus' },
  { id: 'subtract', label: 'Subtract', icon: 'Minus' },
  { id: 'divide', label: 'Divide', icon: 'Divide' },
];
