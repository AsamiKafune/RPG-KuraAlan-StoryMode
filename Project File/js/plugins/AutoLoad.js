/*:
 * @plugindesc Removes title screen, 1-step save, autoload
 * permaDeath option in parameters
 *
 * @author Starbird
 *
 * @param permaDeath ON
 * @desc Set to true for permadeath. Erases save file on Gameover.
 * @default false
 * @help This plugin skips the title screen, autoloads saved game if it exists, and starts new game otherwise. There is only one save file, and saving is
 * only one step. Set permaDeath ON to true if you want the save file to be erased upon Gameover.
 */
 
 var parameters = PluginManager.parameters('jumpStart');
 var permaDeath = Boolean(parameters['permaDeath ON'] || false);
 
 //THIS CHANGES SCENE BOOT TO REMOVE TITLE SCREEN. IT CHECKS IF THERE IS A SAVED FILE AND AUTO LOADS IT IF THERE IS ONE. OTHERWISE, IT STARTS NEW GAME.
Scene_Boot.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
     }
    else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
     }
    else if (DataManager.isAnySavefileExists() == true){
      DataManager.loadGame(1);
      $gameSystem.onAfterLoad();
      SceneManager.goto(Scene_Map);
      }
    else {
      this.checkPlayerLocation();
      DataManager.setupNewGame();
      SceneManager.goto(Scene_Map);
      }
    this.updateDocumentTitle();
};
//THIS CHANGES MAXIMUM NUMBER OF SAVE FILES TO 1. THIS PROBABLY ISN'T NECESSARY FOR THE SCRIPT.
 DataManager.maxSavefiles = function() {
    return 1;
      };
//THIS CHANGES 'SAVE' IN MENU --AND EVERYWHERE ELSE-- TO A SIMPLE, ONE-STEP SAVE

Scene_Save.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
       $gameSystem.onBeforeSave();
    DataManager.saveGame(1);
    SceneManager.push(Scene_Map);
    SoundManager.playSave();
    };
//CHANGES WHAT HAPPENS AFTER GAMEOVER
Scene_Gameover.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.slowFadeSpeed(), false);
    if (permaDeath == true) {StorageManager.remove(1)}
    else {};
};
//WHAT HAPPENS AFTER GAMEOVER SCREEN INSTEAD OF TITLE SCREEN
Scene_Gameover.prototype.gotoTitle = function() {
    if (permaDeath == true) {
      this.checkPlayerLocation();
      DataManager.setupNewGame();
      SceneManager.goto(Scene_Map)
    }
    else {
        if (DataManager.isAnySavefileExists() == true){
      DataManager.loadGame(1);
      $gameSystem.onAfterLoad();
      SceneManager.goto(Scene_Map);
      }
        else {
      this.checkPlayerLocation();
      DataManager.setupNewGame();
      SceneManager.goto(Scene_Map);
         };
       };
    };
// WHAT HAPPENS ON "GAME END"
function Scene_GameEnd() {
    this.initialize.apply(this, arguments);
}

Scene_GameEnd.prototype = Object.create(Scene_MenuBase.prototype);
Scene_GameEnd.prototype.constructor = Scene_GameEnd;

Scene_GameEnd.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_GameEnd.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
};

Scene_GameEnd.prototype.stop = function() {
    Scene_MenuBase.prototype.stop.call(this);
    this._commandWindow.close();
};

Scene_GameEnd.prototype.createBackground = function() {
    Scene_MenuBase.prototype.createBackground.call(this);
    this.setBackgroundOpacity(128);
};

Scene_GameEnd.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_GameEnd();
    this._commandWindow.setHandler('toTitle',  this.commandToTitle.bind(this));
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_GameEnd.prototype.commandToTitle = function() {
    this.fadeOutAll();
    StorageManager.remove(1)
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Map);
};

function Window_GameEnd() {
    this.initialize.apply(this, arguments);
}

Window_GameEnd.prototype = Object.create(Window_Command.prototype);
Window_GameEnd.prototype.constructor = Window_GameEnd;

Window_GameEnd.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.updatePlacement();
    this.openness = 0;
    this.open();
};

Window_GameEnd.prototype.windowWidth = function() {
    return 240;
};

Window_GameEnd.prototype.updatePlacement = function() {
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = (Graphics.boxHeight - this.height) / 2;
};

Window_GameEnd.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame, 'toTitle');
    this.addCommand(TextManager.cancel,  'cancel');
};