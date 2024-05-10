import heapq

class PriorityQueue:

    def __init__(self):
        self.heap = []

    def push(self, item):
        heapq.heappush(self.heap, item)

    def pop(self):
        if self.heap:
            return heapq.heappop(self.heap)
        else:
            return None

def time_schedule(times, duration, plan_id, number_of_plans, employee_pay_rate, employee_id, number_of_employees, sts_open, sts_close):
    """
    Function to schedule tasks and assign employees based on their pay rate and availability.

    Returns:
    min_cost: Minimum cost for the schedule.
    assignment: Dictionary mapping task IDs to employee IDs and start times.
    """

    def hm_to_minutes(time_string):
        # Convert time string in HH:MM format to minutes.
        hour, minutes = time_string.split(':')
        minute_value = int(hour) * 60 + int(minutes)
        return minute_value

    def min_to_time(minutes):
        # Convert minutes to time string in HH:MM format.
        hour = str(minutes // 60)
        min = str(minutes % 60)
        time_string = hour + ':' + min
        return time_string

    # Initialize variables
    min_cost = 0
    assignment = {}

    # Create a list of tasks sorted by end times
    plans = []
    for i in range(number_of_plans):
        start = hm_to_minutes(times[i])
        end = start + duration[i]
        p_id = plan_id[i]
        plans.append([end, start, p_id])
    plans.sort()

    # Initialize priority queue with employees sorted by pay rate
    pq = PriorityQueue()
    for i in range(number_of_employees):
        pq.push([0, employee_pay_rate[i], employee_id[i]])

    # Assign tasks to employees based on their availability and pay rate
    for i in range(number_of_plans):
        best_op = pq.pop()

        start = plans[i][1]
        end = plans[i][0]
        if best_op[0] > start:
            # If employee is busy, assign task when available
            p_id = plans[i][2]
            assignment[p_id] = [best_op[2], min_to_time(best_op[0])]
            dur = end - start
            min_cost += float(best_op[1] * dur) / 60
            best_op[0] = best_op[0] + dur
            pq.push(best_op)
        else:
            # If employee is available, assign task immediately
            p_id = plans[i][2]
            assignment[p_id] = [best_op[2], min_to_time(start)]
            dur = end - start
            min_cost += float(best_op[1] * dur) / 60
            best_op[0] = end
            pq.push(best_op)

    return min_cost, assignment

# Example usage:
# p_id = [10, 15, 3]
# a = ['10:50', '11:30', '7:23']
# b = [10, 50, 600]
# c = 3
# x = [10, 25, 5]
# e_id = [9, 8, 2]
# y = 3
# p = '6:10'
# q = '12:00'
# m, n = time_schedule(a, b, p_id, c, x, e_id, y, p, q)

# print("Minimum cost:", m)
# print("Task assignments:", n)
