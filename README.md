# cra-context-generator
Contexts generator for create-react-application.
Generates state, context, context provider and context builder for the given state props.
Execute the following command to generate the source code:  
`cra-generate-contexts src dest`  
where:
- `src`: the file name of `.json` file that contains state props description (see examples).
- `dest`: the destination path of generated source code.

Please note, the generator will not create folders, they must exist.

# Link `cra-generate-contexts` command for development
Execute the following command to link `cra-generate-contexts` command to simulate node.js package installation for development:  
`npm link`

# Unlink `cra-generate-contexts` command
Execute the following command to unlink `cra-generate-contexts` command:  
`npm unlink -g`

# Examples
Execute the following command to generate the source code:  
`cra-generate-contexts ./examples/widget-builder-contexts.json ./examples/widget-builder-contexts`

# Versions

### 1.4.0
- added customUpdateLocation feature
- fixed location's pathname serialization issue
- fixed sync location with state issue

### 1.3.0
- simplified contexts for disableContextBuilder set to true
- added forceExternalStateGeneration feature

### 1.2.1
- fixed array type issue

### 1.2.0
- added shouldUpdateLocation functionality
- fixed issues related to isOptional functionality
- fixed object type issue


### 1.1.1
- fixed react-router-dom v6 issues
- removed CustomRouter
- simplified context builder

### 1.1.0
- added options to json file
- fixed isOptional issue

### 1.0.0
- implemented generation context and context builder files
