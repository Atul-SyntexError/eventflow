package com.eventflow.controller;

import com.eventflow.dto.EventSummaryDto;
import com.eventflow.service.AdminEventService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonPayloadMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = "/admin/reports")
public final class AdminReportsPageController extends HttpServlet {

  private static final String VIEW_PATH = "/WEB-INF/views/admin/reports.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
    List<EventSummaryDto> events = adminEventService.listEvents();

    request.setAttribute("reportSelectedEventId", resolveSelectedEventId(events, request.getParameter("eventId")));
    request.setAttribute("adminReportBootstrapJson", jsonPayloadMapper.write(buildBootstrapDataset(events)));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }

  private Map<String, Object> buildBootstrapDataset(List<EventSummaryDto> events) {
    Map<String, Object> dataset = new LinkedHashMap<>();
    dataset.put("events", events);
    return dataset;
  }

  private String resolveSelectedEventId(List<EventSummaryDto> events, String requestedEventId) {
    if (events.isEmpty()) {
      return "";
    }

    if (requestedEventId != null) {
      try {
        long requestedId = Long.parseLong(requestedEventId);
        boolean exists = events.stream().anyMatch(event -> event.eventId() != null && event.eventId() == requestedId);
        if (exists) {
          return String.valueOf(requestedId);
        }
      } catch (NumberFormatException ignored) {
        return String.valueOf(events.get(0).eventId());
      }
    }

    return String.valueOf(events.get(0).eventId());
  }
}