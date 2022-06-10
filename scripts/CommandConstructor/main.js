import { prefix } from './config/prefix';
import { world, BeforeChatEvent, EntityQueryOptions, Player } from 'mojang-minecraft';
/* Events class */

class events {};

/* Custom command wrapper class */

class CommandConstructor {
    constructor() {
        this.registeredCommands = [];
        world.events.beforeChat.subscribe(({ sender, message, cancel }) => {
            if (!message.startsWith(prefix)) return;
            const [typed_command, ...parameters] = message.slice(prefix.length).trim().split(/\s+/g);
            const command = this.registeredCommands.find((c) => { c.name == typed_command.substring(1) });
            if (!command || !sender.hasTag('Staff')) {
                try {
                    sender.runCommand(`tellraw @s {"rawtext":[{"text":"§c"},{"translate":"commands.generic.unknown", "with": ["${typed_command}"]}]}`);
                } catch (error) {
                    console.warn(`[DEBUG - ERROR] ${error}`)
                };
            };
            const args = message.match(/(?<=\").*?(?=\")/g);
            const target = Array.from(world.getPlayers()).find(sel => {
                sel.nameTag == message.match(/(?<=\@).?/)?.[0].replace(/\"/g, '');
            });
            try {
                command.callback(data, parameters, args, target);
            } catch (error) {
                console.warn(`[DEBUG - ERROR] ${error}`);
            };
        });
    };
    construct(data) {
        this.registeredCommands.push(
            {
                "name": data.name.toLowerCase(),
                "description": data.description,
                "use": data.use,
                "callback": data.callback,
                "staff": data.staff
            }
        );
    };
};

class Command extends CommandConstructor {
    /**
     * Register a new custom command
     * @param {String} name Command name
     * @param {String} description Command description
     * @param {String} use Commandu use
     * @param {(data: BeforeChatEvent, parameters: String, args: String[], selector: Player)} callback Command callback 
     * @param {Boolean} staff If the command requires special staff permission
     */
    register(name, description, use, callback, staff = false) {
        const command = {
            "name": name,
            "description": description,
            "use": use,
            "callback": callback,
            "staff": staff
        };
        this.construct(command);
    };
};

/* Database class */

class db {
    get(id) {
        return world.getDynamicProperty(id)
    };
    set(id, value) {
        return world.setDynamicProperty(id, value);
    }
    delete(id) {
        return world.removeDynamicProperty(id);
    };
};

/* Daylight class */

class Daylight {
    daytime;
    day;
    add() {};
    remove() {};
    isNight() {};
    skip() {};
};

/* Weather class */

class weather {};

/* Function definitions */

const broadcast = (message, name = null) => {
    if (!name) {
        return runCommand(`tellraw @a {"rawtext":[{"text":"§7[§r${name}§7]"},{"text":"${message}"}]}`);
    } else {
        return runCommand(`tellraw @a {"rawtext":[{"text":"${message}"}]}`);
    };
};

const sendMessage = (message, name = null) => {
    if (!name) {
        return runCommand(`tellraw @a {"rawtext":[{"text":"§7[§r${name}§7]"},{"text":"${message}"}]}`);
    } else {
        return runCommand(`tellraw @a {"rawtext":[{"text":"${message}"}]}`);
    };
};

/**
 * Run a command, (If specified, the command will be executed in the given dimension context) 
 * @param {String} command Command to execute (Only vanilla commands)
 * @param {String} dimension Optional dimension to run the command (By default overworld)
 * @returns 
 */
const runCommand = (command, dimension = 'overworld') => {
    try {
        return {
            "error": false,
            ...world.getDimension(dimension).runCommand(command)
        };
    } catch (error) {
        return {
            "error": false,
            ...error
        };
    };
};

/**
 * Executes a vanilla minecraft command (if specified, the command will be executed in the given dimension context) 
 * @param {String} command Command to execute (Only vanilla commands)
 * @param {String} dimension Optional dimension to run the command (By default overworld)
 * @returns 
 */
const getPlayers = () => {
    try {
        return {
            ...world.getPlayers()
        };
    } catch (error) {
        return {
            "error": false,
            ...error
        };
    };
};

/* Class variable definitions */

const command = new Command();

const database = new db();

/* Export */

export { broadcast, sendMessage, runCommand, getPlayers, setWeather, toggleDownFall, changeGameRule, tpT, database, command };
