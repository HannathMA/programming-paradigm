% ==============================================================================
% Prolog Paradigm: Declarative Knowledge Base & Constraint-Driven Path Engine
% Solves optimal traffic routing via Unification, Backtracking, and Pattern Matching.
% ==============================================================================

:- dynamic road/5.

% connected/5 represents symmetric bidirectional traversability
connected(X, Y, Distance, Factor, RoadId) :-
    road(X, Y, Distance, Factor, RoadId).
connected(X, Y, Distance, Factor, RoadId) :-
    road(Y, X, Distance, Factor, RoadId).

% travel_route/8: Depth-first path exploration with cycle prevention
% travel_route(Current, Target, Visited, Path, AccCost, AccDist, FinalCost, FinalDist)
travel_route(Target, Target, _, [Target], Cost, Dist, Cost, Dist).

travel_route(Current, Target, Visited, [Current | RestOfPath], AccCost, AccDist, FinalCost, FinalDist) :-
    Current \= Target,
    connected(Current, Next, SegmentDist, Factor, _),
    \+ member(Next, Visited),
    StepCost is SegmentDist * Factor,
    NewAccCost is AccCost + StepCost,
    NewAccDist is AccDist + SegmentDist,
    travel_route(Next, Target, [Next | Visited], RestOfPath, NewAccCost, NewAccDist, FinalCost, FinalDist).

% find_all_routes/3: Gathers all valid acyclic routes between Start and End
find_all_routes(Start, End, Routes) :-
    findall([Cost, Dist, Path],
            travel_route(Start, End, [Start], Path, 0.0, 0.0, Cost, Dist),
            Routes).

% best_route/6: Finds the globally optimal route that minimizes traffic-weighted cost
best_route(Start, End, BestPath, BestCost, BestDist, TotalExplored) :-
    find_all_routes(Start, End, AllRoutes),
    AllRoutes \= [],
    length(AllRoutes, TotalExplored),
    sort(AllRoutes, [[BestCost, BestDist, BestPath] | _]).

% Query entrypoint executed via CLI for backend integration
query_optimal(Start, End) :-
    (   best_route(Start, End, BestPath, BestCost, BestDist, TotalExplored)
    ->  atomic_list_concat(BestPath, ',', PathStr),
        format('RESULT|~w|~2f|~2f|~w~n', [PathStr, BestCost, BestDist, TotalExplored])
    ;   format('NOT_FOUND~n', [])
    ).
