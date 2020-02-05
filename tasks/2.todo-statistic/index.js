const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function processCommand(command) {
    var commandInfo = command.split(' ');
    switch (commandInfo[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            print(getToDoList());
            break;
        case 'important':
            print(getToDoList().filter((value) => value.importance > 0));
            break;
        case 'user':
            print(getToDoList().filter((value) => value.userName.toLowerCase() === commandInfo[1].toLowerCase()));
            break;
        case 'sort':
            sort(commandInfo[1])
            break;
        case 'date':
            print(getToDoList().filter((value) => Date.parse(value.date) >= Date.parse(commandInfo[1])));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function sort(type) {
    switch (type) {
        case 'importance':
            print(getToDoList().sort((a, b) => a.importance < b.importance));
            break;
        case 'user':
            print(getToDoList().sort((a, b) => a.userName < b.userName));
            break;
        case 'date':
            print(getToDoList().sort((a, b) => Date.parse(a.date) < Date.parse(b.date)));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getToDoList() {
    const splitedFiles = getFiles().map(value => {
        return {
            fileName: value.fileName,
            content: value.content.split('\r\n')
        }
    })
    const result = [];
    for (let file of splitedFiles) {
        for (let line of file.content) {
            const toDoHeader = line.match(/\/\/[\s]*todo[\s]*[:]?/i);
            if (toDoHeader !== null) {
                const toDoString = line.substring(toDoHeader.index);
                var splitedToDo = toDoString.split(';');

                const isFormated = splitedToDo.length > 2;

                const fileName = file.fileName;
                const userName = isFormated ? splitedToDo[0].substring(toDoHeader[0].length).trim() : '';
                const date = isFormated ? splitedToDo[1].trim() : '';
                const comment = isFormated ? splitedToDo[2].trim() : splitedToDo[0].substring(toDoHeader[0].length).trim();
                const importance = (comment.match(/!/g) || []).length

                result.push({
                    fileName,
                    importance,
                    userName,
                    date,
                    comment
                })
            }
        }
    }
    return result;
}

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => {
        return {
            content: readFile(path),
            fileName: path.split('/')[1]
        }
    });
}

function print(toDoInfo) {
    const header = { fileName: 'file', userName: 'user', importance: 1, date: 'date', comment: 'comment' }
    const maxLengths = {
        userName: Math.min(10, Math.max(header.userName.length, ...toDoInfo.map(value => value.userName.length))),
        date: Math.min(10, Math.max(header.date.length, ...toDoInfo.map(value => value.date.length))),
        comment: Math.min(50, Math.max(header.comment.length, ...toDoInfo.map(value => value.comment.length))),
        fileName: Math.min(20, Math.max(header.fileName.length, ...toDoInfo.map(value => value.fileName.length)))
    }

    const blocksSeparator = '  |  ';
    const tableBorder = '-'.repeat(maxLengths.fileName + 1 + maxLengths.userName
        + maxLengths.date + maxLengths.comment + 4 * blocksSeparator.length);

    printFormatedLine(header, maxLengths, blocksSeparator);// TODO you can do it!
    console.log(tableBorder);
    for (let element of toDoInfo) {
        printFormatedLine(element, maxLengths, blocksSeparator)
    };
    console.log(tableBorder);
}

function printFormatedLine(element, maxLengths, separator) {// TODO       :  asdsadad;    2016; fsdfsdf!!!!!!!!!!!!!!!!!!!!
    const formatedName = formatString(element.userName, maxLengths.userName);
    const formatedDate = formatString(element.date, maxLengths.date);
    const formatedComment = formatString(element.comment, maxLengths.comment);
    const formatedFileName = formatString(element.fileName, maxLengths.fileName);//ToDo :you can do it 3
    const formatedImportance = element.importance > 0 ? '!' : ' ';

    console.log(`${formatedFileName}${separator}${formatedImportance}${separator}` +
        `${formatedName}${separator}${formatedDate}${separator}${formatedComment}`);//todo digi;2000; 4!!
}

function formatString(string, maxLength) {
    return string.length > maxLength
        ? string.substring(0, maxLength - 3).padEnd(maxLength, '.')
        : string.padEnd(maxLength);
}