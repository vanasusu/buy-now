/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("products").del();
  await knex("products").insert([
    {
      id: 1,
      category: "Watches",
      name:"Casio Analog-Digital Black Dial Men's Watch-GA-2100-1A1DR (G987)",
      description:
        "Dual Time Display, Timer, Stop Watch, Light Up, Water Resistance, World Time",
      image: "https://m.media-amazon.com/images/I/61CUIlQYlqL._UX679_.jpg",
      price: 20000
    },
    {
      id: 2,
      category: "Shoes",
      name:"Red Tape Men's Sports Walking Shoes - Perfect for Walking & Running Black",
      description:
        "Arch Support, Dynamic Feet Support, On-Ground Stability, Soft-Cushioned Insole, Shock Absorption,",
      image: "https://m.media-amazon.com/images/I/61XlZcGOY9L._UY575_.jpg",
      price: 2000,
    },
    {
      id: 3,
      category: "Laptop",
      name:"Lenovo V15 Intel Celeron N4500",
      description:
        "15.6\" (39.62 cm) FHD (1920x1080) Antiglare 250 Nits Thin and Light Laptop (8GB RAM/256GB SSD/Windows 11 Home/Black/1Y Onsite/1.7 kg), 82QYA00MIN",
      image: "https://m.media-amazon.com/images/I/31uLEZHhMDL._SX569_.jpg",
      price: 30000,
    },
    {
      id: 4,
      category: "Musical Instrument",
      name:"Medellin 38\"",
      description:
        "Acoustic Guitar premium wood, free online learning course, Set Of Strings, Strap, Bag and 3 Picks Blue",
      image: "https://m.media-amazon.com/images/I/61dpZn8+qtL._SY450_.jpg",
      price: 1000,
    },
    {
      id: 5,
      name: "Haier 8.5 kg 5 Star Rating Semi Automatic Top load Washing Machine(HTW85-186)",
      category:"Washing Machines",
      description:
        "Semi-automatic top-loading washing machine: Economical, Low water and energy consumption, involves manual effort; Has both washing and drying functions",
      image: "https://m.media-amazon.com/images/I/61WwvcMuFTL._SX466_.jpg",
      price: 12000,
    },
  ]);
};
