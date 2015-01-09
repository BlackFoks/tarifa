tarifa [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)
======

<a href="http://tarifa.tools">
    <img src="./template/assets/logo.png" width="100px" align="center" alt="tarifa logo" />
</a>

*Your friendly toolchain for mobile app development on top of Apache Cordova*

tarifa is a CLI on top of [Apache Cordova](http://cordova.apache.org/).
It aims at simplifying the Apache Cordova workflow and adding features to complete cordova toolchain such as:

* **multiple configurations**: produce multiple unique apps easily on a given platform within a single project.
* **integration of any front-end build system**: integrate your build process in the cordova workflow.
* **interactive project bootstrap**: no need to remember every required information while creating a project, tarifa will guide you
with adequate questions and save the answers in the project files.
* **deployment to hockeyapp from the terminal**: no need to launch a browser to upload a binary file to hockeyapp, tarifa handles it.

### Requirements

| sdk/os                                     | macosx | linux | win32 |
| -------------------------------------------|:------:|:-----:|:-----:|
| [ios](http://developer.apple.com/)         | ✔      | ✗     | ✗     |
| [android](http://developer.android.com/)   | ✔      | ✔     | ✔     |
| [windows phone](http://msdn.microsoft.com/en-us/library/windows/apps/ff630878) | ✗      | ✗     | ✔     |

* [nomad cli: cupertino](https://github.com/nomad/cupertino) (only for ios)
* [ImageMagick](http://www.imagemagick.org/)

### Documentation

Documentation can be read on [tarifa-book](https://www.gitbook.io/content/book/42loops/tarifa/index.html).

### Install

```
npm install tarifa -g
```

Some optional dependencies could fail depending on your os
(such as cordova-deploy-windows-phone fails to install on linux or macosx).

### Usage

```
Usage: tarifa [command] [options]

Commands:

    create         Create a tarifa project (or a cordova plugin)
    prepare        Prepare the www project with a given platform and configuration
    platform       Manage current project platforms
    plugin         Add, remove or list cordova plugins in your project
    build          Build the project for a given platform and configuration
    run            Run the project for a given platform and configuration on your device
    info           Get some information about your environment and your devices
    config         Configure the current project
    check          Check the current project after cloning
    clean          Clean the given platform
    hockeyapp      Interface with hockeyapp beta testing platform
    update         Update current project cordova platforms and core plugins
    watch          Watch current project

Options:

    --version, -v  Show tarifa version number
    --verbose, -V  Add verbosity to commands
    --help, -h     Show this message
```

### Install for developement

```
git clone https://github.com/TarifaTools/tarifa.git && cd tarifa && npm link .
```

### Tests

running all tests without devices:

```
npm test
```

The stdio of `npm test` can be found on our buildbot [ci.tarifa.tools](http://ci.tarifa.tools/)

test with attached devices:

```
npm run test-with-devices
```

you can run single tests from `test/actions` or `xml/**` by calling `npm run mocha -- path/to/test/file`.
For example, calling `tarifa prepare` action tests:

```
npm run mocha -- test/actions/prepare
```

To test the signing process for ad-hoc distribution on ios you need to provide a developer identity, a provisioning file and a bundleid:

```
npm run mocha -- test/actions/sign_ios.js --identity="iPhone Distribution: xxxxxxxxxxxxxxxxxxxxx (xxxxxxxxxx)" --provision="/my/path/to/project.mobileprovision" --id="com.42loops.test" --dist="store"
```

To test the signing process for company app distribution on wp8, you need to provide the path of your certificate and the password:

```
npm run mocha -- test\actions\sign_wp8.js --certificat_path="c:\certificate.pfx" --password="xxxxxx"
```

npm >= 2.0 is needed!

## License

tarifa is licensed under Apache version 2.0

## Sponsors

* [zengularity](http://zengularity.com)

[![Analytics](https://ga-beacon.appspot.com/UA-35740178-1/tarifa/readme?pixel)](https://github.com/igrigorik/ga-beacon)
