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
            const arguments = message.match(/(?<=\").*?(?=\")/g);
            const target = Array.from(world.getPlayers()).find(sel => {
                sel.nameTag == message.match(/(?<=\@).?/)?.[0].replace(/\"/g, '');
            });
            try {
                command.callback(data, parameters, arguments, target);
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
class CustomCommand extends CommandConstructor {
    /**
     * 
     * @param {String} name 
     * @param {String} description 
     * @param {String} use 
     * @param {(data: BeforeChatEvent, parameters: String, arguments: String[], selector: Player)} callback 
     * @param {Boolean} staff 
     */
    constructor(name, description, use, callback, staff = false) {
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