def optimizeFleet(sts, weight, costs_unloaded, costs_loaded, vehicle_capacities, vehicle_remaining_trips, number_of_vehicles, landfill_capacities, landfill_distances, number_of_landfills, landfill_capacitites_csum, landfill_ids,vehicle_id):
    
    global current_capacity
    current_capacity=0
    global dp
    global infinity
    infinity=10**15
    global optimal_fleet
    optimal_fleet=[]
    global eps
    eps=10**-6

    def find_limit(weight):
        l=0
        r=number_of_landfills-1
        current_ans=number_of_landfills
        while l<=r:
            mid=(l+r)//2
            if landfill_capacitites_csum[mid]<=weight:
                l=mid+1
            else:
                current_ans=mid
                r=mid-1
        if current_ans==number_of_landfills:
            return 0,0
        return landfill_ids[current_ans],landfill_distances[current_ans],landfill_capacitites_csum[current_ans]



    def rec(truck_no,trips_done,weight):
        global dp
        if weight==current_capacity:
            return [0,0]
        if truck_no==number_of_vehicles:
            return [infinity,infinity]
        if dp[truck_no][weight][trips_done][0]!=-1:
            return dp[truck_no][weight][trips_done]
        # print(truck_no,trips_done,weight)
        ret,num=rec(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight)

        if trips_done<3:
            cost_unloaded=costs_unloaded[truck_no]
            cost_loaded=costs_loaded[truck_no]
            capacity=vehicle_capacities[truck_no]
            _,distance_travelled,landfill_limit=find_limit(weight)
            for sent in range(1,capacity+1):
                if sent+weight>current_capacity or weight+sent>landfill_limit:
                    break
                truck_cost=cost_unloaded+(cost_loaded-cost_unloaded)*(sent/capacity)+cost_unloaded
                truck_cost=truck_cost*distance_travelled
                nval,nsz=rec(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight+sent)
                nval+=truck_cost
                if nval<ret:
                    ret=nval
                    num=nsz+1
                elif nval==ret:
                    num=min(num,nsz+1)
                if trips_done+1<3:
                    nval,nsz=rec(truck_no,trips_done+1,weight+sent)
                    nval+=truck_cost
                    if nval<ret:
                        ret=nval
                        num=nsz+1
                    elif nval==ret:
                        num=min(num,nsz+1)

        dp[truck_no][weight][trips_done]=[ret,num]
        return [ret,num]
    

    def give_optimal_trucks(truck_no,trips_done,weight,minimum_cost,number_of_transfers):
        # print(truck_no,trips_done,weight,minimum_cost,number_of_transfers)
        if weight==current_capacity:
            return
        

        nval,nsz=rec(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight)
        if abs(nval-minimum_cost)<=eps and nsz==number_of_transfers:
            give_optimal_trucks(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight,minimum_cost,number_of_transfers)
            return
        

        if trips_done<3:

            global optimal_fleet

            cost_unloaded=costs_unloaded[truck_no]
            cost_loaded=costs_loaded[truck_no]
            capacity=vehicle_capacities[truck_no]
            destination,distance_travelled,landfill_limit=find_limit(weight)
            # print(destination,landfill_limit,weight)
            for sent in range(1,capacity+1):
                if sent+weight>current_capacity or weight+sent>landfill_limit:
                    break

                truck_cost=cost_unloaded+(cost_loaded-cost_unloaded)*(sent/capacity)+cost_unloaded
                truck_cost=truck_cost*distance_travelled
                nval,nsz=rec(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight+sent)
                nsz+=1
                nval+=truck_cost
                # print(nval,minimum_cost,nsz,number_of_transfers,sent)
                if abs(nval-minimum_cost)<=eps and nsz==number_of_transfers:
                    optimal_fleet.append([vehicle_id[truck_no],sent,destination,truck_cost])
                    give_optimal_trucks(truck_no+1,3-vehicle_remaining_trips[truck_no+1],weight+sent,minimum_cost-truck_cost,number_of_transfers-1)
                    return
                

                if trips_done+1<3:
                    nval,nsz=rec(truck_no,trips_done+1,weight+sent)
                    nsz+=1
                    nval+=truck_cost
                    if abs(nval-minimum_cost)<=eps and nsz==number_of_transfers:
                        optimal_fleet.append([vehicle_id[truck_no],sent,destination,truck_cost])
                        give_optimal_trucks(truck_no,trips_done+1,weight+sent,minimum_cost-truck_cost,number_of_transfers-1)
                        return
        return





    def possible(weight):
        global dp
        global current_capacity
        int_weight=int(weight)+1
        dp=[[[[-1,-1] for _ in range(5)] for _ in range(int_weight+3)] for _ in range(number_of_vehicles)]
        current_capacity=weight
        return rec(0,3-vehicle_remaining_trips[0],0)

    # print(weight)
    # print(number_of_vehicles)
    # print(len(vehicle_remaining_trips))
    vehicle_remaining_trips.append(0)
    total_capacity=weight
    l=0
    r=total_capacity
    max_possible_weight=0
    while l<=r:
        mid=(l+r)//2
        cost,_=possible(mid)
        if cost<infinity:
            max_possible_weight=mid
            l=mid+1
        else:
            r=mid-1
    cost,number_of_transfers=possible(max_possible_weight)
    # print(cost,number_of_transfers)
    give_optimal_trucks(0,3-vehicle_remaining_trips[0],0,cost,number_of_transfers)
    if len(optimal_fleet)!=number_of_transfers:
        # print(len(optimal_fleet),number_of_transfers)
        print('Error in Optimal Fleet Generation')
    return max_possible_weight,cost,number_of_transfers,optimal_fleet
        