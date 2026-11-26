import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const SOURCE_ROOT = path.resolve("src");
const TEST_ID_ATTRIBUTE = "data-testid";
const componentFiles = [];
const missingSelectors = [];
let checkedRenderRoots = 0;

function collectComponentFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectComponentFiles(absolutePath);
      continue;
    }

    if (
      entry.name.endsWith(".tsx") &&
      !entry.name.endsWith(".spec.tsx") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      componentFiles.push(absolutePath);
    }
  }
}

function unwrapExpression(expression) {
  let current = expression;
  while (ts.isParenthesizedExpression(current)) current = current.expression;
  return current;
}

function getComponent(node) {
  if (
    ts.isFunctionDeclaration(node) &&
    node.name &&
    /^[A-Z]/.test(node.name.text)
  ) {
    return { name: node.name.text, functionNode: node };
  }

  if (
    !ts.isVariableDeclaration(node) ||
    !ts.isIdentifier(node.name) ||
    !/^[A-Z]/.test(node.name.text) ||
    !node.initializer
  ) {
    return undefined;
  }

  const initializer = unwrapExpression(node.initializer);
  if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
    return { name: node.name.text, functionNode: initializer };
  }

  if (ts.isCallExpression(initializer)) {
    const callback = initializer.arguments.find(
      (argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument),
    );
    if (callback) return { name: node.name.text, functionNode: callback };
  }

  return undefined;
}

function hasTestId(jsxNode, sourceFile) {
  const opening = ts.isJsxElement(jsxNode) ? jsxNode.openingElement : jsxNode;
  return opening.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      attribute.name.getText(sourceFile) === TEST_ID_ATTRIBUTE,
  );
}

function reportMissing(componentName, jsxNode, sourceFile, filePath) {
  checkedRenderRoots += 1;
  if (hasTestId(jsxNode, sourceFile)) return;

  const { line } = sourceFile.getLineAndCharacterOfPosition(jsxNode.getStart(sourceFile));
  missingSelectors.push(
    `${path.relative(process.cwd(), filePath)}:${line + 1} (${componentName})`,
  );
}

function inspectFragmentChildren(
  children,
  componentName,
  sourceFile,
  filePath,
  inspectExpression,
) {
  for (const child of children) {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      inspectExpression(child);
    } else if (ts.isJsxExpression(child) && child.expression) {
      inspectExpression(child.expression);
    }
  }
}

function inspectComponent(componentName, functionNode, sourceFile, filePath) {
  const inspectExpression = (rawExpression) => {
    const expression = unwrapExpression(rawExpression);

    if (ts.isConditionalExpression(expression)) {
      inspectExpression(expression.whenTrue);
      inspectExpression(expression.whenFalse);
      return;
    }

    if (ts.isBinaryExpression(expression)) {
      inspectExpression(expression.right);
      return;
    }

    if (ts.isJsxFragment(expression)) {
      inspectFragmentChildren(
        expression.children,
        componentName,
        sourceFile,
        filePath,
        inspectExpression,
      );
      return;
    }

    if (ts.isJsxElement(expression)) {
      const tagName = expression.openingElement.tagName.getText(sourceFile);
      if (tagName === "Fragment" || tagName === "React.Fragment") {
        inspectFragmentChildren(
          expression.children,
          componentName,
          sourceFile,
          filePath,
          inspectExpression,
        );
      } else {
        reportMissing(componentName, expression, sourceFile, filePath);
      }
      return;
    }

    if (ts.isJsxSelfClosingElement(expression)) {
      reportMissing(componentName, expression, sourceFile, filePath);
    }
  };

  if (ts.isArrowFunction(functionNode) && !ts.isBlock(functionNode.body)) {
    inspectExpression(functionNode.body);
    return;
  }

  if (!functionNode.body) return;
  const inspectFunctionBody = (node) => {
    if (
      node !== functionNode &&
      (ts.isFunctionLike(node) || ts.isClassLike(node))
    ) {
      return;
    }
    if (ts.isReturnStatement(node) && node.expression) {
      inspectExpression(node.expression);
      return;
    }
    ts.forEachChild(node, inspectFunctionBody);
  };
  inspectFunctionBody(functionNode.body);
}

collectComponentFiles(SOURCE_ROOT);

for (const filePath of componentFiles) {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const components = [];

  const collectComponents = (node) => {
    const component = getComponent(node);
    if (component) components.push(component);
    ts.forEachChild(node, collectComponents);
  };
  collectComponents(sourceFile);

  for (const component of components) {
    inspectComponent(component.name, component.functionNode, sourceFile, filePath);
  }
}

if (missingSelectors.length > 0) {
  console.error("Rendered component roots without a stable data-testid:");
  for (const missingSelector of missingSelectors) console.error(`- ${missingSelector}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${checkedRenderRoots} rendered component roots with data-testid.`);
}
