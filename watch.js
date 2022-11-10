const fs = require('fs');
const { readdir } = require('fs').promises;
const {resolve} = require("path");
const md5 = require('md5');
const { spawn } = require("child_process");

const foldersToWatch=['./test','./main'];

function buildTestCommand(...args){
    const tapMochaReporter = spawn('tap-mocha-reporter', ['tap']);
    const tapeArgs = ["-r", "ts-node/register/transpile-only"];
    const tape = spawn('tape',tapeArgs.concat(args));
    tape.stdout.pipe(tapMochaReporter.stdin);
    return tapMochaReporter;
}

function runTests(...args){
    console.log(args);
    const testReporter = buildTestCommand(...args);
    testReporter.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    testReporter.stderr.on('data', (data) => {
        console.error(`${data}`);
    });

    testReporter.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

runTests("test/src/**/*.test.ts", "test/src/**/*.test.ts");

function doWhenFile(fileName, existsCallback, notExistsCallBack) {
    console.debug('about to access '+fileName);
    fs.access(fileName, fs.F_OK, (err) => {
        if (err) {
            notExistsCallBack(fileName);
            console.debug('called notExistsCallBack with '+fileName);
            return;
        }
        existsCallback(fileName);
    })
}

function runTestsForSrc(fileName, dir){
    const testFilesDir = dir.replace('/main/','/test/');
    const fileWithoutExtension = fileName.slice(0,fileName.lastIndexOf('.'));

    const expectedTestFile = resolve(testFilesDir,`${fileWithoutExtension}.test.ts`);
    const expectedTestCasesDir = resolve(testFilesDir,fileWithoutExtension);

    const testCasesDirExists=(dirName)=>{
        console.debug(`Couldn\'t find ${expectedTestFile} to run so falling back to searching for test cases folder named after source file ${dirName}`);
        runTests(`${dirName}/**/*.test.ts`);
    };

    const testCasesDirNotExists=(dirName)=>{
        console.error(`${expectedTestFile} or ${dirName} does not exist, couldn't find the test files to run corresponding to changed file, doing nothing. Better follow test files structure convention. eg.: Either each file should have a corresponding test file following ./test/src/<source fileName>.test.ts pattern or there should be test files under a folder named after the source file following ./test/src/**/<source file name> pattern`);
    };

    doWhenFile(expectedTestFile,runTests,()=>{doWhenFile(expectedTestCasesDir,testCasesDirExists,testCasesDirNotExists);});
}

let md5Previous = null;
let fsWait = false;

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
            yield res;
        }
        // else {
        //     yield res;
        // }
    }
}

function watch(dirName){
    fs.watch(dirName, (event, fileName) => {
        if (fileName) {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);
            const res = resolve(dirName, fileName);
            try {
                const md5Current = md5(fs.readFileSync(res));
                if (md5Current === md5Previous) {
                    return;
                }
                md5Previous = md5Current;
                if(fileName.indexOf('.test.')!==-1){
                    console.debug(`run tests in test file: ${res}`);
                    runTests(res);
                }else{
                    console.debug(`run tests for source file: ${res}`);
                    runTestsForSrc(fileName,dirName);
                }
                console.log(`${fileName} is changed`);
            }catch (error){
                console.log(`When watching changes on ${res} an error occurred.`,error);
            }
        }
    });
}

console.log('Watching files:');
foldersToWatch.forEach(dir=> {
        ;(async () => {
            for await (const f of getFiles(dir)) {
                console.log(f);
                watch(f);
            }
        })()
    }
);