# cra-context-generator
Contexts generator for create-react-application.
Generates state, context, context provider and context builder for the given state props.
Execute the following command to generate the source code:  
`cra-generate-contexts src dest`  
where:
- src: the file name of .json file that contains state props description (see examples).
- dest: the destination path of generated source code.

Please note, the generator will not create folders, they must exist.

# Link `cra-generate-contexts` command for development
Execute the following command to link `cra-generate-contexts` command to simulate node.js package installation for development:  
`npm link`

# Unlink `cra-generate-contexts` command
Execute the following command to unlink `cra-generate-contexts` command:  
`npm unlink -g`

# Examples
Execute the following command to generate source code:  
`cra-generate-contexts ./examples/task.json ./../project-name/src`
