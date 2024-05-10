from datetime import datetime, timezone
import pytz

def schedule(times, duration, number_of_plans, employee_pay_rate, number_of_employees, sts_open, sts_close):

    # Adjacency list to represent the graph of task dependencies
    global adj
    adj = [[] for _ in range(number_of_plans)]

    # Number of tasks assigned
    global taken
    taken = 0

    # Visited array for depth-first search
    global vis

    # Array to keep track of tasks already used tasks
    global used

    # Array to store calculated time for each task
    global val

    # Opening and closing times converted to minutes
    global sts_open_min
    global sts_close_min

    # Array to store tasks assigned to each employee
    global assigned

    # Array to store the assignment of each task to an employee
    global assignment

    # Function to convert time in HH:MM format to minutes
    def hm_to_minutes(time_string):
        hour, minutes = time_string.split(':')
        minute_value = int(hour) * 60 + int(minutes)
        return minute_value
    
    # Depth First Search for calculating the time for each chain of tasks
    def dfs(i):
        global vis
        global used
        global val
        global sts_open_min
        global sts_close_min
        
        valx = duration[i]  # Time needed for task i
        mx = 0  # Max time among dependent tasks
        chld = 0  # Number of children (dependent tasks)
        for x in adj[i]:
            if used[x] == 1:
                continue
            chld += 1
            if vis[x]==0:
                dfs(x)
            mx = max(mx, val[x])
        if chld == 0:
            start = hm_to_minutes(times[i])
            end = start + duration[i]
            if end < sts_close_min and end > sts_open_min:
                val[i] = valx  # Task can be completed within business hours
            elif end < sts_close_min:
                val[i] = sts_open_min - start  # Task ends before opening hours
            else:
                whole_day_min = hm_to_minutes('24:00')
                val[i] = whole_day_min - end + sts_open_min  # Task ends after closing hours
                
        else:
            val[i] = valx + mx  # Total time for task including dependent tasks

    # Depth First Search for assigning tasks to employees
    def dfs2(i, req, emp):
        global used
        global val
        global assigned
        global assignment
        global taken

        nreq = req - duration[i]  # Remaining time needed for dependent tasks
        assigned[emp].append(i)  # Assign task to employee
        assignment[i] = emp  # Record task assignment
        used[i] = 1  # Mark task as used
        taken += 1  # Increment number of tasks taken
        if nreq == 0:
            return
        for x in adj[i]:
            if used[x] == 1:
                continue
            xreq = val[x]
            if xreq == nreq:
                dfs2(x, xreq, emp)
                return
    
    # Convert opening and closing time to minutes
    sts_open_min = hm_to_minutes(sts_open)
    sts_close_min = hm_to_minutes(sts_close)
    
    # Create a list of start and end times in minutes
    minute_start_end = []
    for i in range(number_of_plans):
        start = hm_to_minutes(times[i])
        end = start + int(duration[i])
        minute_start_end.append([start, end])

    # Construct adjacency list for the directed acyclic graph
    for i in range(number_of_plans):
        start = minute_start_end[i][0]
        end = minute_start_end[i][1]
        for j in range(number_of_plans):
            start2 = minute_start_end[j][0]
            end2 = minute_start_end[j][1]
            if start2 > end:
                adj[i].append(j)  # Task j can be done after task i

    min_cost = 0  # Minimum cost for the schedule
    emp_used = 0  # Number of employees used
    ops = []  # List to store employee pay rates
    for i in range(number_of_employees):
        ops.append([employee_pay_rate[i], i])  
    ops.sort()  # Sort employees based on pay rates
    print(ops)
    print(adj)
    used = [0 for _ in range(number_of_plans)] 
    assigned = [[] for _  in range(number_of_employees)]  
    assignment = [None for _ in range(number_of_plans)]  
    while taken < number_of_plans and emp_used < number_of_employees:
        vis = [0 for _ in range(number_of_plans)]  # Reset visited array
        val = [0 for _ in range(number_of_plans)]  # Reset time calculation array
        for i in range(number_of_plans):
            if vis[i] == 1 or used[i] == 1:
                continue
            print(i)
            dfs(i)  # Calculate time for each task
        mx_val = -1  # Maximum time for a task
        mx_root = -1  # Task with maximum time
        for i in range(number_of_plans):
            if val[i] > mx_val:
                mx_val = val[i]
                mx_root = i
        dfs2(mx_root, mx_val, ops[emp_used][1])  # Assign tasks to employee with lowest pay rate
        min_cost = float(mx_val * ops[emp_used][0]) / 60  # Calculate cost for assigned tasks
        emp_used += 1  # Increment employee counter
        print(val)
        print(emp_used, taken)

    return min_cost, assigned, assignment
    
# Example usage
a = ['10:50', '11:30', '7:23']
b = [10, 50, 600]
c = 3
x = [10, 25, 5]
y = 3
p = '6:10'
q = '12:00'
m, n, o = schedule(a, b, c, x, y, p, q)

print(m)
print(n)
print(o)
