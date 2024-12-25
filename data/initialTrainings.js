// const trainingSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     required: true,
//     enum: ['Physical', 'Technical', 'Tactical', 'Mental', 'Set Pieces', 'recovery'], // Antrenman tipi
//   },
//   defenceImpact: { type: Number, required: true }, // Defans etkisi
//   attackImpact: { type: Number, required: true }, // Atak et
//   formImpact: { type: Number, required: true }, // Form etkisi
//   moraleImpact: { type: Number, required: true }, // Moral etkisi
//   staminaImpact: { type: Number, required: true }, // Dayanıklılık etkisi
//   cost: { type: Number, required: true }, // Maliyet
//   level: { type: Number, required: true }, // Seviye

// });



const initialTrainings = [
  {
    type: 'Physical',
    defenceImpact: 0,
    attackImpact: 0,
    formImpact: 0,
    moraleImpact: 0,
    staminaImpact: 10,
    cost: 100,
    level: 1,
  },
  {
    type: 'Technical',
    defenceImpact: 0,
    attackImpact: 10,
    formImpact: 0,
    moraleImpact: 0,
    staminaImpact: 0,
    cost: 100,
    level: 1,
  },
  {
    type: 'Tactical',
    defenceImpact: 5,
    attackImpact: 5,
    formImpact: 0,
    moraleImpact: 0,
    staminaImpact: 0,
    cost: 100,
    level: 1,
  },
  {
    type: 'Mental',
    defenceImpact: 0,
    attackImpact: 0,
    formImpact: 0,
    moraleImpact: 10,
    staminaImpact: 0,
    cost: 100,
    level: 1,
  },
  {
    type: 'Set Pieces',
    defenceImpact: 5,
    attackImpact: 5,
    formImpact: 0,
    moraleImpact: 0,
    staminaImpact: 0,
    cost: 100,
    level: 1,
  },
  {
    type: 'Recovery',
    defenceImpact: 0,
    attackImpact: 0,
    formImpact: 0,
    moraleImpact: 0,
    staminaImpact: 0,
    cost: 100,
    level: 1,
  },
];