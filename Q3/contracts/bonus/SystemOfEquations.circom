pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matSub.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution


    // [bonus] insert your code here

    component matElemMul[n];
    component sumVector[n];
    component subtraction;
    component sumAll;
    component isZero;

    // mult each row of a with b
    for (var i=0; i<n; i++) {
        matElemMul[i] = matElemMul(1,n);

        for (var j=0; j<n; j++) {
          matElemMul[i].a[0][j] <== A[i][j];
          matElemMul[i].b[0][j] <== x[j];
        }
    }

    for (var i=0; i<n; i++) {
        // sum each row to get Ax
        sumVector[i] = matElemSum(1,n);

        for (var j=0; j<n; j++) {
          sumVector[i].a[0][j] <== matElemMul[i].out[0][j];
        }
    }

    // subtract Ax - b
    subtraction = matSub(1,n);

    for(var i=0; i<n; i++) {
      subtraction.a[0][i] <== sumVector[i].out;
      subtraction.b[0][i] <== b[i];
    }


    //sum all results
    sumAll = matElemSum(1,n);

    for (var i=0; i<n; i++) {
      sumAll.a[0][i] <== subtraction.out[0][i];
    }

    // check that sum is zero
    isZero = IsZero();
    isZero.in <== sumAll.out;

    out <== isZero.out;


}

component main {public [A, b]} = SystemOfEquations(3);
