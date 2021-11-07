const { schedule } = require('node-cron');

function sampleCronJob({ interval, ...otherParameters }) {
    try {
        schedule(`* */${interval.minute} */${interval.hour} * * *`, async () => {
            // YOUR CODE GOES HERE
            console.log(otherParameters);
        });
    } catch (e) {
        NODE_ENV === 'DEVELOPMENT'
            ? console.log(`sampleCronJob: ${e.message}`)
            : appEvent.emit('error', e.message);
    }
}

function justACronJob({ interval, ...otherParameters }) {
    try {
        schedule(`* */${interval.minute} */${interval.hour} * * *`, async () => {
            // YOUR CODE GOES HERE
            console.log(otherParameters);
        });
    } catch (e) {
        NODE_ENV === 'DEVELOPMENT'
            ? console.log(`justACronJob: ${e.message}`)
            : appEvent.emit('error', e.message);
    }
}

module.exports = { sampleCronJob, justACronJob };
