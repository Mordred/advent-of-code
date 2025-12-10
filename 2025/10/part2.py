import sys
from scipy.optimize import linprog

part2 = 0
for lights, *buttons, jolts in map(str.split, open(sys.argv[1])):
    buttons = [[int(i) for i in b[1:-1].split(',')] for b in buttons]
    jolts = [int(i) for i in jolts[1:-1].split(',')]

    costs = [1 for b in buttons]
    equations = [[i in b for b in buttons] for i in range(len(jolts))]
    part2 += linprog(costs, A_eq=equations, b_eq=jolts, integrality=1).fun

print("Part 2:", int(part2))
