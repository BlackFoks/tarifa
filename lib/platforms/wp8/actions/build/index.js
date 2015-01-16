module.exports.beforeCompile = function (conf, options) {
    return options;
};

/* tasks definition */
module.exports.tasks = {
    'clean-resources': [],
    'pre-cordova-prepare': [
        'lib/platforms/shared/actions/build/tasks/clean',
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens',
        'lib/platforms/wp8/actions/build/tasks/change_assembly_info'
    ],
    'pre-cordova-compile': [
        'lib/platforms/wp8/actions/build/tasks/change_manifest',
        'lib/platforms/wp8/actions/build/tasks/change_csproj'
    ],
    'post-cordova-compile': [
        'lib/platforms/wp8/actions/build/tasks/run_xap_sign_tool'
    ],
    'undo': [
        'lib/platforms/shared/actions/build/tasks/reset_config_xml'
    ]
};
