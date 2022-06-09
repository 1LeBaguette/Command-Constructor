import { prefix } from './config/prefix';
import { world, BeforeChatEvent, EntityQueryOptions, Player } from 'mojang-minecraft';
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
export class CustomCommand extends CommandConstructor {
    /**
     * Register a new custom command
     * @param {String} name Command name
     * @param {String} description Command description
     * @param {String} use Command use
     * @param {(data: BeforeChatEvent, parameters: String, args: String[], selector: Player)} callback Command callback (internal code)
     * @param {Boolean} staff If the player need to be an staff to execute the command  
     */
    register(name, description, use, callback, staff = false) {
        const cmd = {
            "name": name,
            "description": description,
            "use": use,
            "callback": callback,
            "staff": staff
        };
        this.construct(cmd);
    };
};
export const command = new CustomCommand(), run = (cmd, dim = 'overworld') => {
    try {
        return { error: false, ...world.getDimension(dim).runCommand(cmd) };
    } catch (error) {
        return { error: true, ...error };
    };
};
