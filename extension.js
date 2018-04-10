// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const path = require('path');


function exec_pandoc(inFile, outFile, pandocFormat, pandocOptions) {
    var space = '\x20';
    var cmd = 'pandoc' + space + '-t' + space + pandocFormat + space + inFile + space + '-o' + space + outFile + space + pandocOptions;
    exec(cmd, function (error, stdout, stderr) {
        if (stdout !== null) {
            vscode.window.showInformationMessage('Successful export to' + outFile + '.');
            //TODO: open the outFile in vscode
        }
    })
}

function gen_tmp_file() {
    var cmd = "mktemp -d";
    return execSync(cmd).toString().trim();
}

function export_to_file(toBuffer) {
    var editor = vscode.window.activeTextEditor;
    var fullName = path.normalize(editor.document.fileName);
    var filePath = path.dirname(fullName);
    var fileName = path.basename(fullName);
    var fileNameOnly = path.parse(fileName).name;

    var items = [];
    items.push({
        label: 'pdf',
        suffix: 'pdf',
        description: 'Render as pdf document'
    });
    items.push({
        label: 'docx',
        suffix: 'docx',
        description: 'Render as word document'
    });
    items.push({
        label: 'html',
        suffix: 'html',
        description: 'Render as html document'
    });
    items.push({
        label: 'dokuwiki',
        suffix: 'txt',
        description: 'Render as dokuwiki document'
    });

    vscode.window.showQuickPick(items).then((selection) => {
        if (!selection) {
            return;
        }
        var inFile = path.join(filePath, fileName).replace(/(^.*$)/gm, "\"" + "$1" + "\"");
        var outFile = (path.join(filePath, fileNameOnly) + '.' + selection.suffix).replace(/(^.*$)/gm, "\"" + "$1" + "\"");
        var pandocOptions = vscode.workspace.getConfiguration('mexportPandoc').get(selection.label + 'OptString');
        var pandocFormat = selection.label;

        if (toBuffer) {
            outFile = (path.join(path.normalize(gen_tmp_file()), fileNameOnly) + '.' + selection.suffix).replace(/(^.*$)/gm, "\"" + "$1" + "\"");
        }
        exec_pandoc(inFile, outFile, pandocFormat, pandocOptions)
    })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "mexport" is now active!');
    let asFilePro = vscode.commands.registerCommand('extension.asFile', function () {
        export_to_file(false)
    });
    context.subscriptions.push(asFilePro);

    let asBufferPro = vscode.commands.registerCommand('extension.asBuffer', () => {
        export_to_file(true)
    });
    context.subscriptions.push(asBufferPro);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
