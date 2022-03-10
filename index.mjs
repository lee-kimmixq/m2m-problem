import sequelizePackage from 'sequelize';
import allConfig from './config/config.js';

const { Sequelize } = sequelizePackage;
const { DataTypes, Op } = Sequelize;
const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

// ============================== MODEL SETUP =======================================

db.User = sequelize.define(
  'user',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    email: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    password: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    underscored: true,
  },
);
db.Game = sequelize.define(
  'game',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    gameState: {
      allowNull: false,
      type: DataTypes.JSON,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    underscored: true,
  },
);
db.GameUser = sequelize.define(
  'game_user',
  {
    player_number: {
      type: DataTypes.INTEGER,
    },
    score: {
      type: DataTypes.INTEGER,
    },
  },
  {
    underscored: true,
  },
);

db.User.belongsToMany(db.Game, { through: db.GameUser });
db.Game.belongsToMany(db.User, { through: db.GameUser });

db.User.hasMany(db.GameUser);
db.GameUser.belongsTo(db.User);
db.Game.hasMany(db.GameUser);
db.GameUser.belongsTo(db.Game);

// =====================================================================================

const create = async (userId) => {
  const cardDeck = ['a', 'b', 'c'];

  const newGame = {
    gameState: {
      cardDeck,
      player1Hand: [],
      player2Hand: [],
    },
  };

  try {
    const user = await db.User.findByPk(userId); // find current user
    if (!user) throw new Error('cannot find user');

    const game = await db.Game.create(newGame); // create row in games table
    if (!game) throw new Error('cannot create new game');

    const opponent = await db.User.findOne({ // find a random user that is NOT current user
      where: { id: { [Op.not]: userId } },
      order: Sequelize.literal('random()'),
    });
    if (!opponent) throw new Error('cannot find opponent');

    // !!! FOR THE NEXT 2 PROMISES, playerNumber DOESN'T WORK BUT player_number WORKS !!!
    // create row in games_users table
    await game.addUser(user, { through: { playerNumber: 1, score: 9 } });
    // create row for opponent in games_users table
    await game.addUser(opponent, { through: { playerNumber: 2, score: 9 } });

    console.log('success');
  } catch (error) {
    console.log(error);
  }
};

create(process.argv[2]);
// run 'node index.mjs 1' in terminal
