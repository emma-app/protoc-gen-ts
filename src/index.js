const plugin = require("./compiler/plugin");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const type = require("./type");
const descriptor = require("./descriptor");
const rpc = require("./rpc");

function createImport(identifier, moduleSpecifier) {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(undefined, ts.factory.createNamespaceImport(identifier)),
    ts.factory.createStringLiteral(moduleSpecifier)
  );
}

function replaceExtension(filename, extension = ".ts") {
  return filename.replace(/\.[^/.]+$/, extension)
}

const request = plugin.CodeGeneratorRequest.deserialize(new Uint8Array(fs.readFileSync(0)));
const response = new plugin.CodeGeneratorResponse({
  supported_features: plugin.CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
});

for (const descriptor of request.proto_file) {
  type.preprocess(descriptor, descriptor.name, `.${descriptor.package || ""}`);
}

for (const fileDescriptor of request.proto_file) {
  const name = replaceExtension(fileDescriptor.name);
  const pbIdentifier = ts.factory.createUniqueName("pb");
  const grpcIdentifier = ts.factory.createUniqueName("grpc");

  // Will keep track of import statements
  const importStatements = [];


  // Create all named imports from dependencies
  for (const dependency of fileDescriptor.dependency) {
    const identifier = ts.factory.createUniqueName("dependency");
    const moduleSpecifier = replaceExtension(dependency, "");
    type.setIdentifierForDependency(dependency, identifier);
    const importedFrom = `./${path.relative(path.dirname(fileDescriptor.name), moduleSpecifier)}`;
    importStatements.push(createImport(identifier, importedFrom));
  }

  // Create all messages recursively
  let statements = [];

  // Process enums
  for (const enumDescriptor of fileDescriptor.enum_type) {
    statements.push(descriptor.createEnum(enumDescriptor));
  }


  // Process root messages
  for (const messageDescriptor of fileDescriptor.message_type) {
    statements = statements.concat(
      descriptor.processDescriptorRecursively(fileDescriptor, messageDescriptor, pbIdentifier)
    )
  }

  if (statements.length) {
    importStatements.push(createImport(pbIdentifier, "google-protobuf"));
  }

  // Create all services and clients
  for (const serviceDescriptor of fileDescriptor.service) {
    statements.push(rpc.createServiceInterface(fileDescriptor, serviceDescriptor, grpcIdentifier));
    statements.push(rpc.createServerInterface(fileDescriptor, serviceDescriptor, grpcIdentifier));
    statements.push(rpc.createService(fileDescriptor, serviceDescriptor));
    statements.push(rpc.createServiceClient(fileDescriptor, serviceDescriptor, grpcIdentifier));
  }

  // Import grpc only if there is service statements
  if (fileDescriptor.service.length) {
    importStatements.push(createImport(grpcIdentifier, process.env.GRPC_PACKAGE_NAME || "@grpc/grpc-js"));
  }

  const doNotEditComment = ts.factory.createJSDocComment(
    `Generated by the protoc-gen-ts.  DO NOT EDIT!\n` +
    `source: ${fileDescriptor.name}\n` +
    `git: https://github.com/thesayyn/protoc-gen-ts\n` +
    `buymeacoffee: https://www.buymeacoffee.com/thesayyn\n`
  );

  // Wrap statements within the namespace
  if (fileDescriptor.package) {

    statements = [
      doNotEditComment,
      ...importStatements,
      descriptor.createNamespace(fileDescriptor.package, statements),
    ]
  } else {
    statements = [
      doNotEditComment,
      ...importStatements,
      ...statements
    ];
  }

  const sourcefile = ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
  sourcefile.identifiers = new Set();

  const content = ts
    .createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      omitTrailingSemicolon: true,
    })
    .printFile(sourcefile);

  response.file.push(new plugin.CodeGeneratorResponse.File({
    name,
    content
  }));

  // after each iteration we need to clear the dependency map to prevent accidental 
  // misuse of identifiers
  type.resetDependencyMap();
}

process.stdout.write(response.serialize());