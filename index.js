// Receives Cloudwatch Event when instances terminates and deregister from opsWorks
// Useful when using Spot Instances or AutoScaling
var aws = require('aws-sdk');

// Your OpsWorks stack ID should be set here
var opsWorksStackID = '';

exports.handler = function (event, context) {
    if (event.source == 'aws.ec2') {
        var eventInstanceID = event.detail['instance-id'];
        if (typeof eventInstanceID == 'string') {
            var opsWorks = new aws.OpsWorks();
            var params = { StackId: opsWorksStackID };
            opsWorks.describeInstances(params, function(err, data) {
                if (err) {
                    context.done('error', err);
                } else {
                    var params = null;
                    for (var idx in data.Instances) {
                        if (data.Instances[idx].Ec2InstanceId == eventInstanceID) {
                            params = {InstanceId: data.Instances[idx].InstanceId};
                            break;
                        }
                    }
                    if (params !== null) {
                        opsWorks.deregisterInstance(params, function(err, data) {
                                console.log('Deregistering instance from OpsWorks: InstanceID=' + eventInstanceID);
                                if (err) {
                                    context.done('error', err);
                                } else {
                                    context.done(null, 'Deregistration OK');
                                }
                        });
                    } else {
                        context.done(null,"InstanceID " + eventInstanceID + " not listed in OpsWorks. Exiting...");
                    }
                }
            });
        } else {
            context.done(error,'Invalid event InstanceID: ' + eventInstanceID);
        }
    }
}
