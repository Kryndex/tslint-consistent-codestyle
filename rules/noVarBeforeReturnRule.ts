import * as ts from 'typescript';
import * as Lint from 'tslint';

import { bindingNameContains, getPreviousStatement, isIdentifier } from '../src/utils';
import {ReturnStatementWalker} from '../src/walker';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ReturnWalker(sourceFile, this.getOptions()));
    }
}

class ReturnWalker extends ReturnStatementWalker {
    public visitReturnStatement(node: ts.ReturnStatement) {
        if (node.expression !== undefined && isIdentifier(node.expression)) {
            const statement = getPreviousStatement(node);
            if (statement !== undefined) {
                if (statement.kind === ts.SyntaxKind.VariableStatement) {
                    const declarationList = (<ts.VariableStatement>statement).declarationList.declarations;
                    if (bindingNameContains(declarationList[declarationList.length - 1].name, node.expression.text, true)) {
                        const sourceFile = this.getSourceFile();
                        this.addFailure(this.createFailure(node.expression.getStart(sourceFile),
                                                           node.expression.getWidth(sourceFile),
                                                           `don't declare variable ${node.expression.text} to return it immediately`));
                    }
                }
            }
        }
    }
}
