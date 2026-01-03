<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Requests\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Models\HouseHub;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, HouseHub $houseHub)
    {
        $userId = auth()->id();
        $role = Role::where('house_hub_id', $houseHub->id)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->first();

        if (!$role) {
            return response()->json([
                'message' => 'You are not authorized to create announcements for this HouseHub.'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $announcement = Announcement::create([
            'user_id' => $userId,
            'house_hub_id' => $houseHub->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'announcement' => $announcement
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(HouseHub $houseHub)
    {
        $announcements = Announcement::where('house_hub_id', $houseHub->id)
            ->with('user:id,name') 
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'announcements' => $announcements
        ], Response::HTTP_OK);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Announcement $announcement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        //
    }
}
